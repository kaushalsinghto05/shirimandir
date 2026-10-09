import crypto from 'node:crypto';
import { query } from '../../database/db.js';
import { eventBus, DomainEvents } from '../../core/events/eventBus.js';

export class BookingService {
  /**
   * Initiate a new puja booking
   */
  async createBooking(bookingData, devoteeUser) {
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
    } = bookingData;

    if (!puja_id || !scheduled_date || !sankalp_name) {
      throw {
        status: 400,
        message: 'Puja ID, scheduled date, and devotee sankalp name are required'
      };
    }

    const numericPujaId = parseInt(puja_id, 10) || 1;
    let pujaRes = await query(
      `SELECT p.*, t.id AS temple_id, t.name AS temple_name, t.slug AS temple_slug
       FROM pujas p
       JOIN temples t ON p.temple_id = t.id
       WHERE p.id = $1 AND p.is_active = 1`,
      [numericPujaId]
    );

    if (pujaRes.rows.length === 0) {
      pujaRes = await query(
        `SELECT p.*, t.id AS temple_id, t.name AS temple_name, t.slug AS temple_slug
         FROM pujas p
         JOIN temples t ON p.temple_id = t.id
         WHERE p.id = 1 AND p.is_active = 1`
      );
    }

    if (pujaRes.rows.length === 0) {
      throw { status: 404, message: 'Puja offering not found' };
    }
    const puja = pujaRes.rows[0];

    let basePricePaise = puja.base_price_paise;
    const numericPkgId = parseInt(package_id, 10) || null;
    let selectedPackageId = numericPkgId;

    if (numericPkgId) {
      const pkgRes = await query('SELECT * FROM puja_packages WHERE id = $1', [numericPkgId]);
      if (pkgRes.rows.length > 0) {
        basePricePaise = pkgRes.rows[0].price_paise;
      }
    }

    let addonsAmountPaise = 0;
    if (Array.isArray(addons)) {
      addonsAmountPaise = addons.reduce((sum, item) => sum + (Number(item.price_paise) || 0), 0);
    }

    const platformFeePaise = 5000;
    const taxPaise = 0;
    const totalAmountPaise = basePricePaise + addonsAmountPaise + platformFeePaise + taxPaise;

    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingCode = `BK-${puja.temple_slug.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${randomSuffix}`;
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
        devoteeUser.id,
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

    eventBus.publish(DomainEvents.BOOKING_CREATED, {
      bookingId: newBooking.id,
      bookingCode,
      userId: devoteeUser.id,
      totalAmountPaise
    });

    return {
      booking: newBooking,
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
    };
  }

  /**
   * Get devotee bookings
   */
  async getDevoteeBookings(userId) {
    const { rows } = await query(
      `SELECT b.*, p.title AS puja_title, p.category AS puja_category,
              t.name AS temple_name, t.location AS temple_location, t.verification_status
       FROM bookings b
       JOIN pujas p ON b.puja_id = p.id
       JOIN temples t ON b.temple_id = t.id
       WHERE b.user_id = $1
       ORDER BY b.id DESC`,
      [userId]
    );

    return rows.map(b => ({
      ...b,
      base_amount_inr: b.base_amount_paise / 100,
      total_amount_inr: b.total_amount_paise / 100,
      has_proof_of_service: Boolean(b.proof_media_url),
      consent_data_shared: Boolean(b.consent_data_shared)
    }));
  }

  /**
   * Get single booking with privacy filters
   */
  async getBookingById(bookingId, requestingUser) {
    const { rows } = await query(
      `SELECT b.*, p.title AS puja_title, p.description AS puja_description,
              t.name AS temple_name, t.location AS temple_location, t.verification_status,
              u.name AS devotee_real_name, u.phone AS devotee_real_phone
       FROM bookings b
       JOIN pujas p ON b.puja_id = p.id
       JOIN temples t ON b.temple_id = t.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (rows.length === 0) return null;

    const booking = rows[0];
    const isOwner = requestingUser.id === booking.user_id;
    const isStaff = ['admin', 'temple_partner'].includes(requestingUser.role);

    if (!isOwner && !isStaff) {
      throw { status: 403, message: 'Access denied' };
    }

    let displaySankalpName = booking.sankalp_name;
    let displayPhone = booking.devotee_real_phone;

    if (!isOwner && requestingUser.role === 'temple_partner' && !booking.consent_data_shared) {
      displaySankalpName = `Devotee [Anonymous Sankalp] - Gotra: ${booking.sankalp_gotra}`;
      displayPhone = 'PROTECTED (No devotee consent given)';
    }

    return {
      ...booking,
      sankalp_name: displaySankalpName,
      devotee_phone: displayPhone,
      base_amount_inr: booking.base_amount_paise / 100,
      total_amount_inr: booking.total_amount_paise / 100,
      consent_data_shared: Boolean(booking.consent_data_shared)
    };
  }

  /**
   * Upload proof of service & complete booking
   */
  async uploadProof(bookingId, { mediaUrl, proof_media_type = 'photo', proof_notes }, uploaderUserId) {
    if (!mediaUrl || String(mediaUrl).trim().length === 0) {
      throw {
        status: 422,
        message: 'Compliance Violation: A sacred puja booking can ONLY be marked as "completed" once authentic photo or video proof of service is attached for the devotee.',
        requiredField: 'proof_media'
      };
    }

    const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (bookingRes.rows.length === 0) {
      throw { status: 404, message: 'Booking not found' };
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
      [mediaUrl, proof_media_type, now, uploaderUserId, proof_notes || 'Ritual completed in accordance with Vedic traditions', bookingId]
    );

    eventBus.publish(DomainEvents.BOOKING_COMPLETED, {
      bookingId,
      proofMediaUrl: mediaUrl,
      completedAt: now
    });

    return {
      bookingId,
      status: 'completed',
      proof_media_url: mediaUrl,
      proof_media_type,
      proof_uploaded_at: now
    };
  }

  /**
   * Transition booking to confirmed (called via DomainEvent or directly)
   */
  async confirmBooking(bookingId) {
    const now = new Date().toISOString();
    await query(
      'UPDATE bookings SET status = \'confirmed\', updated_at = $1 WHERE id = $2',
      [now, bookingId]
    );
    console.log(`[BOOKING MODULE] Booking #${bookingId} confirmed on payment capture.`);
  }
}

export const bookingService = new BookingService();
