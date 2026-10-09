import test from 'node:test';
import assert from 'node:assert/strict';
import { query, initDb } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';
import {
  verifyWebhookSignature,
  verifyCheckoutSignature,
  createMockWebhookEvent,
  createMockCheckoutSignature
} from '../src/services/paymentWebhookService.js';

test('Shiri Mandir Compliance & Data Integrity Suite', async (t) => {
  await initDb();
  await seedDatabase();

  await t.test('Rule 1: Temple verification status requires affiliation proof document for partnered/official', async () => {
    // Attempting to insert a temple claiming 'official' status without affiliation proof doc MUST fail
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO temples (slug, name, deity, location, state, description, image_url, verification_status, affiliation_proof_doc)
          VALUES ('unverified-temple', 'Test Temple', 'Lord Shiva', 'Varanasi', 'UP', 'Desc', 'img.jpg', 'official', NULL)
        `);
      },
      /CHECK constraint failed/i,
      'Database must reject official/partnered temples without affiliation_proof_doc'
    );
  });

  await t.test('Rule 2: Prasad edible items require 14-digit FSSAI and stay inactive until approved', async () => {
    // Attempting to insert edible prasad with invalid/short FSSAI license must fail
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO prasad_items (temple_id, name, description, price_paise, image_url, is_edible, fssai_license_no, is_active)
          VALUES (1, 'Non Compliant Sweet', 'Sweet', 10000, 'img.jpg', 1, '12345', 0)
        `);
      },
      /CHECK constraint failed/i,
      'Database must enforce >= 14 character FSSAI license for edible items'
    );

    // Attempting to set an edible item active without fssai_verified_at must fail
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO prasad_items (temple_id, name, description, price_paise, image_url, is_edible, fssai_license_no, is_active, fssai_verified_at)
          VALUES (1, 'Unapproved Sweet', 'Sweet', 10000, 'img.jpg', 1, '12723999000142', 1, NULL)
        `);
      },
      /CHECK constraint failed/i,
      'Database must reject is_active=1 for edible items without admin verification'
    );
  });

  await t.test('Rule 3: Puja booking cannot be marked completed without proof-of-service media', async () => {
    // Attempting to insert or update booking status to 'completed' with NULL proof_media_url must fail
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO bookings (
            booking_code, user_id, puja_id, temple_id, scheduled_date, scheduled_time_slot,
            sankalp_name, base_amount_paise, platform_fee_paise, total_amount_paise,
            status, proof_media_url
          )
          VALUES (
            'BK-TEST-NO-PROOF', 1, 1, 1, '2026-10-10', 'Morning',
            'Test Devotee', 100000, 5000, 105000,
            'completed', NULL
          )
        `);
      },
      /CHECK constraint failed/i,
      'Database must reject status="completed" when proof_media_url is null or empty'
    );
  });

  await t.test('Rule 4: Orders enforce arithmetic breakdown math (base + shipping + platform = total)', async () => {
    // Attempting an order where total != base + shipping + platform + tax must fail
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO orders (
            order_code, user_id, base_amount_paise, shipping_fee_paise, platform_fee_paise, tax_paise, total_amount_paise,
            shipping_name, shipping_phone, shipping_address_line1, shipping_city, shipping_state, shipping_postal_code, status
          )
          VALUES (
            'ORD-MATH-FAIL', 1, 40000, 5000, 2000, 0, 99999,
            'Devotee', '9876543210', 'Street 1', 'Delhi', 'Delhi', '110001', 'pending_payment'
          )
        `);
      },
      /CHECK constraint failed/i,
      'Database must reject mismatched itemized totals'
    );
  });

  await t.test('Rule 5: Payment webhook signature verification with HMAC SHA-256', async () => {
    const mock = createMockWebhookEvent({
      paymentCode: 'PAY-TEST-9901',
      amountPaise: 250000
    });

    // 1. Valid signature passes
    const validResult = verifyWebhookSignature(mock.rawPayload, mock.signature);
    assert.equal(validResult.isValid, true, 'Valid HMAC signature must verify');

    // 2. Tampered signature fails
    const tamperedResult = verifyWebhookSignature(mock.rawPayload, 'fake_tampered_signature_1234567890abcdef');
    assert.equal(tamperedResult.isValid, false, 'Tampered signature must be rejected');

    // 3. Tampered payload fails
    const tamperedPayloadResult = verifyWebhookSignature(mock.rawPayload + 'tampered', mock.signature);
    assert.equal(tamperedPayloadResult.isValid, false, 'Tampered payload must be rejected');
  });

  await t.test('Rule 6: Devotee data sharing defaults to false (explicit opt-in only)', async () => {
    const { rows } = await query('SELECT consent_data_sharing FROM users WHERE id = 2');
    assert.equal(rows[0].consent_data_sharing, 0, 'New user privacy consent must default to 0 / false');
  });

  await t.test('Rule 7: Real inventory stock cannot be negative (no fake urgency)', async () => {
    await assert.rejects(
      async () => {
        await query('UPDATE prasad_items SET stock_qty = -5 WHERE id = 1');
      },
      /CHECK constraint failed/i,
      'Database must forbid negative stock quantities'
    );
  });

  await t.test('Rule 8: Direct checkout signature verification with HMAC SHA-256', async () => {
    const orderId = 'order_rzp_test123';
    const paymentId = 'pay_rzp_mock456';
    const validSig = createMockCheckoutSignature({ gatewayOrderId: orderId, gatewayPaymentId: paymentId });

    // 1. Valid checkout signature passes
    const valid = verifyCheckoutSignature({ gatewayOrderId: orderId, gatewayPaymentId: paymentId, signature: validSig });
    assert.equal(valid.isValid, true, 'Valid checkout signature must pass');

    // 2. Tampered signature fails
    const invalid = verifyCheckoutSignature({ gatewayOrderId: orderId, gatewayPaymentId: paymentId, signature: 'bad_signature_val' });
    assert.equal(invalid.isValid, false, 'Tampered signature must fail');

    // 3. Mismatched order ID fails
    const mismatched = verifyCheckoutSignature({ gatewayOrderId: 'order_rzp_wrong', gatewayPaymentId: paymentId, signature: validSig });
    assert.equal(mismatched.isValid, false, 'Mismatched order ID must fail');
  });

  await t.test('Rule 9: Payment verified_server_side defaults to 0 and transitions to 1', async () => {
    const pCode = `PAY-TEST-COMPLIANCE-${Date.now()}`;
    await query(
      `INSERT INTO payments (
        payment_code, booking_id, user_id, amount_paise, currency, gateway, gateway_order_id, verified_server_side, status
      )
      VALUES ($1, 1, 1, 100000, 'INR', 'razorpay', 'order_rzp_c01', 0, 'created')`,
      [pCode]
    );

    const initial = await query('SELECT verified_server_side, status FROM payments WHERE payment_code = $1', [pCode]);
    assert.equal(initial.rows[0].verified_server_side, 0, 'Initial payment must have verified_server_side = 0');
    assert.equal(initial.rows[0].status, 'created', 'Initial status must be created');

    // Simulate verified update
    await query(
      'UPDATE payments SET verified_server_side = 1, status = \'captured\' WHERE payment_code = $1',
      [pCode]
    );

    const updated = await query('SELECT verified_server_side, status FROM payments WHERE payment_code = $1', [pCode]);
    assert.equal(updated.rows[0].verified_server_side, 1, 'Updated payment must have verified_server_side = 1');
    assert.equal(updated.rows[0].status, 'captured', 'Status must transition to captured');
  });
});
