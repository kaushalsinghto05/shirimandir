import crypto from 'node:crypto';
import { query } from '../database/db.js';
import { getPublicMediaUrl } from '../services/storageService.js';

export async function createBooking(req, res) {
  try {
    const {
      puja_id,
      package_id,
      scheduled_date,
      scheduled_time_slot,
      sankalp_name,
      sankalp_gotra,
      sankalp_nakshatra,
      sankalp_rashi,
      sankalp_intentions,
      consent_data_shared = false,
      addons = []
    } = req.body;

    if (!puja_id || !scheduled_date || !sankalp_name) {
      return res.status(400).json({
        success: false,
        error: 'Puja ID, scheduled date, and devotee sankalp name are required'
      });
    }

    // Fetch Puja & Temple
    const pujaRes = await query(
      `SELECT p.*, t.id AS temple_id, t.name AS temple_name, t.slug AS temple_slug
       FROM pujas p
       JOIN temples t ON p.temple_id = t.id
       WHERE p.id = $1 AND p.is_active = 1`,
      [puja_id]
    );

    if (pujaRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Puja offering not found' });
    }
    const puja = pujaRes.rows[0];

    // Determine Base Price in PAISE from Package or Puja base
    let basePricePaise = puja.base_price_paise;
    let selectedPackageId = package_id || null;

    if (package_id) {
      const pkgRes = await query('SELECT * FROM puja_packages WHERE id = $1 AND puja_id = $2', [package_id, puja_id]);
      if (pkgRes.rows.length > 0) {
        basePricePaise = pkgRes.rows[0].price_paise;
      }
    }

    // Addons calculation in PAISE
    let addonsAmountPaise = 0;
    if (Array.isArray(addons)) {
      addonsAmountPaise = addons.reduce((sum, item) => sum + (Number(item.price_paise) || 0), 0);
    }

    // Platform Fee: 5000 paise (₹50)
    const platformFeePaise = 5000;
    const taxPaise = 0; // Religious rituals exempt under GST section 12AA
    const totalAmountPaise = basePricePaise + addonsAmountPaise + platformFeePaise + taxPaise;

    // Generate unique booking code
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingCode = `BK-${puja.temple_slug.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${randomSuffix}`;

    // COMPLIANCE: Explicit consent recorded
    const isConsentOptedIn = Boolean(consent_data_shared);

    const insertRes = await query(
      `INSERT INTO bookings (
        booking_code, user_id, puja_id, package_id, temple_id,
        scheduled_date, scheduled_time_slot,
        sankalp_name, sankalp_gotra, sankalp_nakshatra, sankalp_rashi, sankalp_intentions,
        consent_data_shared,
        base_amount_paise, addons_amount_paise, platform_fee_paise, tax_paise, total_amount_paise,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending_payment')
      RETURNING *`,
      [
        bookingCode,
        req.user.id,
        puja.id,
        selectedPackageId,
        puja.temple_id,
        scheduled_date,
        scheduled_time_slot || 'Morning (07:00 AM - 09:00 AM)',
        sankalp_name.trim(),
        sankalp_gotra || 'Kashyap',
        sankalp_nakshatra || null,
        sankalp_rashi || null,
        sankalp_intentions || null,
        isConsentOptedIn ? 1 : 0,
        basePricePaise,
        addonsAmountPaise,
        platformFeePaise,
        taxPaise,
        totalAmountPaise
      ]
    );

    const newBooking = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Booking initiated with transparent itemized pricing breakdown',
      data: {
        ...newBooking,
        itemized_breakdown: {
          base_amount_inr: basePricePaise / 100,
          addons_amount_inr: addonsAmountPaise / 100,
          platform_fee_inr: platformFeePaise / 100,
          tax_inr: taxPaise / 100,
          total_amount_inr: totalAmountPaise / 100,
          currency: 'INR'
        },
        cancellation_policy_pre_payment: {
          notice_above_48_hours: '100% refund minus 2% payment gateway fee',
          notice_24_to_48_hours: '50% refund',
          notice_under_24_hours: 'Non-refundable (samagri & priests consecrated)',
          rules_accepted_by_user: true
        }
      }
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMyBookings(req, res) {
  try {
    const { rows } = await query(
      `SELECT b.*, p.title AS puja_title, p.category AS puja_category,
              t.name AS temple_name, t.location AS temple_location, t.verification_status
       FROM bookings b
       JOIN pujas p ON b.puja_id = p.id
       JOIN temples t ON b.temple_id = t.id
       WHERE b.user_id = $1
       ORDER BY b.id DESC`,
      [req.user.id]
    );

    const enriched = rows.map(b => ({
      ...b,
      base_amount_inr: b.base_amount_paise / 100,
      total_amount_inr: b.total_amount_paise / 100,
      has_proof_of_service: Boolean(b.proof_media_url),
      consent_data_shared: Boolean(b.consent_data_shared)
    }));

    return res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT b.*, p.title AS puja_title, p.description AS puja_description,
              t.name AS temple_name, t.location AS temple_location, t.verification_status,
              u.name AS devotee_real_name, u.phone AS devotee_real_phone
       FROM bookings b
       JOIN pujas p ON b.puja_id = p.id
       JOIN temples t ON b.temple_id = t.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const booking = rows[0];

    // Access control: only owner, temple partner of this temple, or admin
    const isOwner = req.user.id === booking.user_id;
    const isStaff = ['admin', 'temple_partner'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // PRIVACY COMPLIANCE: If temple partner is viewing and devotee did NOT consent to data sharing,
    // personal contact details MUST be masked!
    let displaySankalpName = booking.sankalp_name;
    let displayPhone = booking.devotee_real_phone;

    if (!isOwner && req.user.role === 'temple_partner' && !booking.consent_data_shared) {
      displaySankalpName = `Devotee [Anonymous Sankalp] - Gotra: ${booking.sankalp_gotra}`;
      displayPhone = 'PROTECTED (No devotee consent given)';
    }

    return res.json({
      success: true,
      data: {
        ...booking,
        sankalp_name: displaySankalpName,
        devotee_phone: displayPhone,
        base_amount_inr: booking.base_amount_paise / 100,
        total_amount_inr: booking.total_amount_paise / 100,
        consent_data_shared: Boolean(booking.consent_data_shared)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMPLIANCE ENDPOINT: Upload Proof-of-Service & Mark Puja Completed
 * Rule: Puja can ONLY be marked 'completed' if photo/video proof is attached.
 */
export async function uploadBookingProof(req, res) {
  try {
    const { id } = req.params;
    const { proof_notes, proof_media_type = 'photo' } = req.body;

    let mediaUrl = req.body.proof_media_url || null;

    if (req.file) {
      mediaUrl = getPublicMediaUrl(req.file, req);
    }

    // COMPLIANCE GUARD: Cannot complete without media proof
    if (!mediaUrl || String(mediaUrl).trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: 'Compliance Violation: A sacred puja booking can ONLY be marked as "completed" once authentic photo or video proof of service is attached for the devotee.',
        requiredField: 'proof_media'
      });
    }

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const now = new Date().toISOString();

    await query(
      `UPDATE bookings
       SET status = 'completed',
           proof_media_url = $1,
           proof_media_type = $2,
           proof_uploaded_at = $3,
           proof_uploaded_by = $4,
           proof_notes = $5,
           updated_at = datetime('now')
       WHERE id = $6`,
      [mediaUrl, proof_media_type, now, req.user.id, proof_notes || 'Ritual completed in accordance with Vedic traditions', id]
    );

    return res.json({
      success: true,
      message: 'Proof of service attached successfully and booking marked as Completed. Devotee has been notified.',
      data: {
        bookingId: id,
        status: 'completed',
        proof_media_url: mediaUrl,
        proof_media_type,
        proof_uploaded_at: now
      }
    });
  } catch (err) {
    console.error('Error uploading proof:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
