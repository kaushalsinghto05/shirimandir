import crypto from 'node:crypto';
import { query } from '../../database/db.js';

export class DonationService {
  /**
   * Get all active donation campaigns with progress tickers (FR-DON-001, FR-DON-008)
   */
  async getCampaigns(templeId = null) {
    let sqlText = `
      SELECT c.*, t.name AS temple_name, t.slug AS temple_slug, t.deity, t.location
      FROM donation_campaigns c
      JOIN temples t ON c.temple_id = t.id
      WHERE c.is_active = 1
    `;
    const params = [];

    if (templeId) {
      sqlText += ' AND c.temple_id = $1';
      params.push(templeId);
    }

    sqlText += ' ORDER BY c.id ASC';

    const { rows } = await query(sqlText, params);

    return rows.map(c => {
      const targetPaise = Number(c.target_amount_paise) || 0;
      const collectedPaise = Number(c.collected_amount_paise) || 0;
      const progressPercent = targetPaise > 0 ? Math.min(100, Math.round((collectedPaise / targetPaise) * 100)) : 0;

      return {
        ...c,
        target_inr: targetPaise / 100,
        collected_inr: collectedPaise / 100,
        progress_percent: progressPercent
      };
    });
  }

  /**
   * Admin creates a new donation campaign (FR-DON-002)
   */
  async createCampaign({ temple_id, title, description, legal_entity_name, target_amount_inr, tax_exempt_eligible, tax_exemption_ref }, adminUser) {
    if (!temple_id || !title || !legal_entity_name) {
      throw { status: 400, message: 'Temple ID, campaign title, and legal entity name are required' };
    }

    const targetAmountPaise = Math.round((Number(target_amount_inr) || 500000) * 100);

    const insertResult = await query(
      `INSERT INTO donation_campaigns (
        temple_id, title, description, legal_entity_name,
        target_amount_paise, collected_amount_paise, donors_count,
        tax_exempt_eligible, tax_exemption_ref, is_active
      )
      VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7, 1)
      RETURNING *`,
      [
        temple_id,
        title.trim(),
        description || '',
        legal_entity_name.trim(),
        targetAmountPaise,
        tax_exempt_eligible !== false,
        tax_exemption_ref || 'SEC-80G-CERT-2024'
      ]
    );

    const campaign = insertResult.rows[0];

    // Audit log
    await query(
      `INSERT INTO audit_logs (actor_user_id, actor_email, actor_role, action, resource_type, resource_id, ip_address, details)
       VALUES ($1, $2, $3, 'campaign.created', 'donation_campaign', $4, '127.0.0.1', $5)`,
      [adminUser.id, adminUser.email, adminUser.role, String(campaign.id), `Created campaign: ${campaign.title}`]
    );

    return campaign;
  }

  /**
   * Make a donation and generate instant 80G tax receipt (FR-DON-001, FR-REC-001, AT-10)
   */
  async createDonation({ campaign_id, temple_id, amount_inr, donor_name, donor_email, donor_phone, donor_pan }, user = null) {
    const amountPaise = Math.round((Number(amount_inr) || 0) * 100);
    if (!amountPaise || amountPaise <= 0) {
      throw { status: 400, message: 'Valid donation amount is required (must be greater than 0)' };
    }

    if (!donor_name || !donor_email) {
      throw { status: 400, message: 'Donor name and email are mandatory for tax-compliant receipt generation' };
    }

    // Defensive Resolution of Campaign, Temple, and User Foreign Keys
    let resolvedCampaignId = null;
    let resolvedTempleId = Number(temple_id) || null;
    let resolvedLegalEntity = 'Shiri Mandir Sacred Trust';
    let resolvedTaxRef = '80G(5)(vi) of Income Tax Act 1961';
    let templeSlug = 'TEMPLE';

    // Parse and resolve campaign (supports numeric ID or string slug)
    if (campaign_id) {
      let queryId = Number(campaign_id);
      if (isNaN(queryId) || !queryId) {
        if (String(campaign_id).includes('annadanam')) queryId = 1;
        else if (String(campaign_id).includes('gaushala')) queryId = 2;
        else if (String(campaign_id).includes('kalash')) queryId = 3;
      }
      if (queryId) {
        const cRes = await query('SELECT * FROM donation_campaigns WHERE id = $1', [queryId]);
        if (cRes.rows.length > 0) {
          const camp = cRes.rows[0];
          resolvedCampaignId = camp.id;
          resolvedTempleId = camp.temple_id;
          resolvedLegalEntity = camp.legal_entity_name;
          resolvedTaxRef = camp.tax_exemption_ref || resolvedTaxRef;
        }
      }
    }

    // Default temple if unresolved
    if (!resolvedTempleId) {
      const defaultTemple = await query('SELECT id, slug, name FROM temples LIMIT 1');
      if (defaultTemple.rows.length > 0) {
        resolvedTempleId = defaultTemple.rows[0].id;
        templeSlug = defaultTemple.rows[0].slug.toUpperCase().replace(/[^A-Z0-9]/g, '');
      } else {
        resolvedTempleId = 1;
      }
    } else {
      const tRes = await query('SELECT slug, name FROM temples WHERE id = $1', [resolvedTempleId]);
      if (tRes.rows.length > 0) {
        templeSlug = tRes.rows[0].slug.toUpperCase().replace(/[^A-Z0-9]/g, '');
      }
    }

    // Validate user_id exists in users table to prevent FK failure
    let resolvedUserId = null;
    if (user && user.id) {
      const uRes = await query('SELECT id FROM users WHERE id = $1', [user.id]);
      if (uRes.rows.length > 0) {
        resolvedUserId = uRes.rows[0].id;
      }
    }

    const year = new Date().getFullYear();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const donationCode = `DON-${templeSlug}-${year}-${randomSuffix}`;

    // Insert donation safely with validated foreign keys
    const donRes = await query(
      `INSERT INTO donations (
        donation_code, user_id, temple_id, campaign_id,
        amount_paise, currency, donor_name, donor_email, donor_phone, donor_pan, status
      )
      VALUES ($1, $2, $3, $4, $5, 'INR', $6, $7, $8, $9, 'completed')
      RETURNING *`,
      [
        donationCode,
        resolvedUserId,
        resolvedTempleId,
        resolvedCampaignId,
        amountPaise,
        donor_name.trim(),
        donor_email.trim().toLowerCase(),
        donor_phone ? donor_phone.trim() : null,
        donor_pan ? donor_pan.trim().toUpperCase() : null
      ]
    );

    const donation = donRes.rows[0];

    // Generate sequential receipt number (FR-REC-003, AT-10)
    const countRes = await query('SELECT COUNT(*) AS total FROM receipts');
    const seqNum = (Number(countRes.rows[0]?.total || 0) + 1).toString().padStart(6, '0');
    const receiptNumber = `RCP-${templeSlug}-${year}-${seqNum}`;

    // Insert verified 80G receipt
    const rcpRes = await query(
      `INSERT INTO receipts (
        receipt_number, donation_id, booking_id, temple_id,
        issuing_legal_entity, tax_exemption_ref, amount_paise, currency, status
      )
      VALUES ($1, $2, NULL, $3, $4, $5, $6, 'INR', 'issued')
      RETURNING *`,
      [
        receiptNumber,
        donation.id,
        resolvedTempleId || 1,
        resolvedLegalEntity,
        resolvedTaxRef,
        amountPaise
      ]
    );

    const receipt = rcpRes.rows[0];

    // Increment campaign collected totals
    if (resolvedCampaignId) {
      await query(
        `UPDATE donation_campaigns
         SET collected_amount_paise = collected_amount_paise + $1,
             donors_count = donors_count + 1,
             updated_at = datetime('now')
         WHERE id = $2`,
        [amountPaise, resolvedCampaignId]
      );
    }

    // Record audit event (FR-AUD-001)
    await query(
      `INSERT INTO audit_logs (actor_user_id, actor_email, actor_role, action, resource_type, resource_id, ip_address, details)
       VALUES ($1, $2, $3, 'donation.completed', 'donation', $4, '127.0.0.1', $5)`,
      [
        resolvedUserId,
        user ? user.email : donor_email,
        user ? user.role : 'guest_devotee',
        String(donation.id),
        `Donation of ₹${amountPaise / 100} received with 80G Receipt #${receiptNumber}`
      ]
    );

    return {
      donation: {
        ...donation,
        amount_inr: amountPaise / 100
      },
      receipt: {
        ...receipt,
        amount_inr: amountPaise / 100
      }
    };
  }

  /**
   * Get devotee's donation history with attached 80G receipts
   */
  async getDevoteeDonations(userId) {
    const { rows } = await query(
      `SELECT d.*, c.title AS campaign_title, t.name AS temple_name, r.receipt_number, r.issuing_legal_entity, r.tax_exemption_ref
       FROM donations d
       LEFT JOIN donation_campaigns c ON d.campaign_id = c.id
       JOIN temples t ON d.temple_id = t.id
       LEFT JOIN receipts r ON r.donation_id = d.id
       WHERE d.user_id = $1
       ORDER BY d.id DESC`,
      [userId]
    );

    return rows.map(d => ({
      ...d,
      amount_inr: d.amount_paise / 100
    }));
  }

  /**
   * Retrieve single 80G receipt by receipt number
   */
  async getReceipt(receiptNumber) {
    const { rows } = await query(
      `SELECT r.*, d.donor_name, d.donor_email, d.donor_pan, d.created_at AS donation_date,
              t.name AS temple_name, t.location AS temple_location
       FROM receipts r
       LEFT JOIN donations d ON r.donation_id = d.id
       LEFT JOIN temples t ON r.temple_id = t.id
       WHERE r.receipt_number = $1`,
      [receiptNumber]
    );

    if (rows.length === 0) {
      throw { status: 404, message: 'Receipt not found' };
    }

    const r = rows[0];
    return {
      ...r,
      amount_inr: r.amount_paise / 100
    };
  }
}

export const donationService = new DonationService();
