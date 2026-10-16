import bcrypt from 'bcryptjs';
import { query, initDb, getDbEngine } from './db.js';

export async function seedDatabase() {
  console.log(`[SEED] Initializing database schema (${getDbEngine()})...`);
  await initDb();

  console.log('[SEED] Seeding initial data...');

  // 1. Seed Users (with hashed passwords)
  const passwordHash = await bcrypt.hash('HarHarMahadev@123', 10);
  
  // Devotee with completed profile and consent
  await query(`
    INSERT INTO users (id, name, email, password_hash, phone, role, gotra, rashi, nakshatra, profile_completed, consent_data_sharing, consent_timestamp, consent_ip_address)
    VALUES 
    (1, 'Kaushal Singh', 'kaushal@example.com', $1, '+919876543210', 'devotee', 'Kashyap', 'Dhanu', 'Moola', TRUE, TRUE, CURRENT_TIMESTAMP, '127.0.0.1')
    ON CONFLICT (id) DO NOTHING;
  `, [passwordHash]);

  // Devotee with completed profile without consent
  await query(`
    INSERT INTO users (id, name, email, password_hash, phone, role, gotra, rashi, nakshatra, profile_completed, consent_data_sharing)
    VALUES 
    (2, 'Aarav Sharma', 'aarav@example.com', $1, '+919811122233', 'devotee', 'Bharadwaj', 'Mesh', 'Ashwini', TRUE, FALSE)
    ON CONFLICT (id) DO NOTHING;
  `, [passwordHash]);

  // Standard Devotee Account (devotee@shirimandir.org)
  await query(`
    INSERT INTO users (name, email, password_hash, phone, role, gotra, rashi, nakshatra, profile_completed, consent_data_sharing)
    VALUES 
    ('Devotee Shiri Mandir', 'devotee@shirimandir.org', $1, '+919876500000', 'devotee', 'Kashyap', 'Dhanu', 'Moola', TRUE, TRUE)
    ON CONFLICT (email) DO NOTHING;
  `, [passwordHash]);

  // Temple Partner (Priest / Coordinator)
  await query(`
    INSERT INTO users (id, name, email, password_hash, phone, role, profile_completed)
    VALUES 
    (3, 'Pandit Kashi Nath Shastri', 'priest.kashi@shirimandir.org', $1, '+919450012345', 'temple_partner', TRUE)
    ON CONFLICT (id) DO NOTHING;
  `, [passwordHash]);

  // Admin user
  await query(`
    INSERT INTO users (id, name, email, password_hash, phone, role, profile_completed)
    VALUES 
    (4, 'Shiri Mandir Compliance Admin', 'admin@shirimandir.org', $1, '+919999900000', 'admin', TRUE)
    ON CONFLICT (id) DO NOTHING;
  `, [passwordHash]);

  // Super Admin user
  await query(`
    INSERT INTO users (id, name, email, password_hash, phone, role, profile_completed)
    VALUES 
    (5, 'Shiri Mandir Super Admin', 'superadmin@shirimandir.org', $1, '+919888877777', 'super_admin', TRUE)
    ON CONFLICT (id) DO NOTHING;
  `, [passwordHash]);

  // 2. Seed 3 Sample Temples
  // Compliance Rules Applied:
  // - Kashi: 'official' (requires affiliation_proof_doc)
  // - Tirupati: 'partnered' (requires affiliation_proof_doc)
  // - Siddhivinayak: 'independent' (never default to implying affiliation without signed doc)
  await query(`
    INSERT INTO temples (
      id, slug, name, deity, location, state, description, history, significance, timings,
      image_url, banner_url, darshan_stream_url, darshan_stream_status, current_wait_minutes,
      verification_status, affiliation_proof_doc, affiliation_verified_at, affiliation_verified_by, trust_registration_no, is_active
    )
    VALUES 
    (
      1,
      'kashi-vishwanath',
      'Shri Kashi Vishwanath Temple',
      'Lord Shiva',
      'Varanasi, Uttar Pradesh',
      'Uttar Pradesh',
      'Standing majestically on the holy western bank of the sacred River Ganga, Shri Kashi Vishwanath is one of the twelve sacred Jyotirlingas of Lord Shiva. Devotees believe that a darshan here liberates the soul from the cycle of rebirth.',
      'The temple has stood as the spiritual beacon of Bharat for millennia, reconstructed by Maharani Ahilyabai Holkar of Indore in 1780 and recently revitalized through the grand Kashi Vishwanath Dham Corridor.',
      'The Jyotirlinga of Vishweshwara represents the supreme cosmic light of Lord Shiva that dissolves all karmic afflictions and grants Moksha.',
      '03:00 AM - 11:00 PM (Mangala, Bhog, Sandhya, Shringar Aarti)',
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1600&q=80',
      'https://stream.shirimandir.org/live/kashi-darshan',
      'live',
      20,
      'official',
      'https://storage.shirimandir.org/compliance/docs/kashi_vishwanath_trust_mou_2024.pdf',
      CURRENT_TIMESTAMP,
      4,
      'TRUST-KV-UP-7819',
      TRUE
    ),
    (
      2,
      'tirupati-balaji',
      'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      'Lord Venkateswara (Balaji)',
      'Tirumala Hills, Tirupati',
      'Andhra Pradesh',
      'Perched atop the seven sacred hills of Seshachalam, Sri Venkateswara Temple is revered as the Kaliyuga Vaikuntha where Lord Vishnu manifested to protect and shower prosperity upon all devotees.',
      'Documented since the Pallava, Chola, and Vijayanagara dynasties with sacred inscriptions dating back to the 9th century CE.',
      'Offering prayers and seva here is considered the highest source of spiritual and material grace in Kaliyuga.',
      '02:30 AM - 01:30 AM (Suprabhata Seva to Ekanta Seva)',
      'https://images.unsplash.com/photo-1621370214436-7935fa7c16ce?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80',
      'https://stream.shirimandir.org/live/tirupati-darshan',
      'live',
      45,
      'partnered',
      'https://storage.shirimandir.org/compliance/docs/tirumala_archaka_seva_agreement_2024.pdf',
      CURRENT_TIMESTAMP,
      4,
      'AP-TTD-ARCH-2023',
      TRUE
    ),
    (
      3,
      'siddhivinayak-mumbai',
      'Shree Siddhivinayak Temple',
      'Lord Ganesha',
      'Prabhadevi, Mumbai',
      'Maharashtra',
      'Dedicated to Lord Shri Ganesh whose trunk turns to the right (Siddhi Vinayak), granting wishes and removing insurmountable obstacles from the lives of millions.',
      'Originally consecrated on 19 November 1801 by Laxman Vithu and Deubai Patil to bless childless women and devotees.',
      'Known as the Wish-Fulfilling Sanctum (Navasacha Ganapati). Devotees offer modaks, red hibiscus, and sacred grass (durva).',
      '05:30 AM - 10:00 PM (Kakad Aarti to Shej Aarti)',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=80',
      'https://stream.shirimandir.org/live/siddhivinayak-darshan',
      'scheduled',
      15,
      'independent',
      NULL,
      NULL,
      NULL,
      'MH-BOM-TRUST-1801',
      TRUE
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3. Seed Pujas & Sevas
  // Monetary values stored strictly as integer paise (e.g. ₹1100 = 110000 paise)
  await query(`
    INSERT INTO pujas (id, temple_id, title, deity, description, significance, duration_minutes, base_price_paise, category, max_slots_per_day, includes_prasad, is_active)
    VALUES
    (
      1, 1, 'Maha Rudrabhishek with Sacred Ganga Jal & Bilva Patra',
      'Lord Shiva',
      'Sacred Vedic ritual chanting Namakam and Chamakam while bathing the divine Jyotirlinga with holy Ganga Jal, milk, honey, sugarcane juice, and fresh bilva leaves.',
      'Eliminates planetary doshas, brings inner tranquility, and invokes Mahadeva’s divine grace.',
      60, 210000, 'rudrabhishek', 30, TRUE, TRUE
    ),
    (
      2, 1, 'Special Sandhya Aarti & Bilva Archana',
      'Lord Shiva',
      'Evening Aarti dedicated to Vishweshwara with 108 Bilva Patra offered in devotee’s name with Gotra chanting.',
      'Invokes prosperity, peace of mind, and divine protection.',
      45, 110000, 'aarti', 50, TRUE, TRUE
    ),
    (
      3, 2, 'Kalyanotsavam & Suprabhata Archana Seva',
      'Lord Venkateswara (Balaji)',
      'Divine celestial wedding ceremony of Lord Venkateswara and Goddess Lakshmi-Padmavathi performed by traditional Vedic priests.',
      'Blesses families with matrimonial harmony, boundless abundance, and joy.',
      90, 310000, 'maha_puja', 20, TRUE, TRUE
    ),
    (
      4, 2, 'Sahasra Deepalankarana Seva (1,000 Sacred Lamps)',
      'Lord Venkateswara (Balaji)',
      'Grand evening seva lit by thousands of sacred ghee lamps while devotional hymns are recited.',
      'Dispels ignorance, cures spiritual hurdles, and brings auspicious radiance.',
      60, 180000, 'special_puja', 40, TRUE, TRUE
    ),
    (
      5, 3, 'Shree Ganesh Atharvashirsha Sahasra Avartan',
      'Lord Ganesha',
      '1,000 sacred Vedic recitations of the Ganapati Atharvashirsha accompanied by fresh 21 Durva grass offerings.',
      'Removes stubborn obstacles in career, business, health, and education.',
      75, 150000, 'havan', 25, TRUE, TRUE
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 4. Seed Puja Packages
  await query(`
    INSERT INTO puja_packages (id, puja_id, name, description, max_devotees, price_paise)
    VALUES
    (1, 1, 'Single Devotee Sankalp', 'Puja performed for one individual name and gotra with personal prasad package.', 1, 210000),
    (2, 1, 'Dampati (Couple) Sankalp', 'Performed for husband and wife with sacred dhaga and blessed prasad kit.', 2, 350000),
    (3, 1, 'Sampoorna Parivar (Family of 4)', 'Joint sankalp reciting names, gotra, and nakshatras of up to 4 family members.', 4, 510000),
    (4, 3, 'Individual Kalyana Seva', 'Single devotee sankalp with blessed silk angavastram & laddu prasad.', 1, 310000),
    (5, 3, 'Family Kalyana Seva', 'Full family participation sankalp with blessed silver coin & prasad.', 4, 750000),
    (6, 5, 'Individual Vighnaharta Seva', 'Sankalp with 21 durva offerings & modak box delivery.', 1, 150000),
    (7, 5, 'Vyapar Vriddhi Family Seva', 'Family sankalp with consecrated silver Ganesha coin.', 4, 350000)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 5. Seed Prasad Items
  // Compliance Rules Applied:
  // - All is_edible items have genuine 14-digit FSSAI licenses
  // - Admin approval fssai_verified_at is set for active edible items
  // - Real inventory stock_qty strictly maintained (no fake urgency)
  await query(`
    INSERT INTO prasad_items (
      id, temple_id, name, description, price_paise, weight_grams, ingredients, shelf_life_days,
      image_url, stock_qty, is_edible, fssai_license_no, fssai_verified_at, fssai_verified_by, is_active
    )
    VALUES
    (
      1, 1,
      'Kashi Vishwanath Sacred Peda & Dry Fruit Mahaprasad Box',
      'Handcrafted pure desi cow ghee peda infused with saffron, cardamom, and blessed holy dry fruits from Kashi Vishwanath Sanctum.',
      45000, 400, 'Desi Ghee, Pure Khoya, Saffron, Almonds, Cashews, Cardamom', 14,
      'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
      120, TRUE, '12723999000142', CURRENT_TIMESTAMP, 4, TRUE
    ),
    (
      2, 1,
      'Maha Shringar Ganga Jal Kalash & Bhasma Kit',
      'Certified authentic Ganga Jal collected during Brahma Muhurta, consecrated Shiva Bhasma, and Rudraksha talisman.',
      25000, 250, 'Sacred Ganga Jal, Vibhuti Bhasma, Certified Panchamukhi Rudraksha', 365,
      'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?auto=format&fit=crop&w=800&q=80',
      85, FALSE, NULL, NULL, NULL, TRUE
    ),
    (
      3, 2,
      'Authentic Tirupati Laddu Mahaprasad (GI Tagged)',
      'Legendary world-famous Tirupati Balaji Laddu made with pure ghee, boondi, sugar candy, raisins, and roasted cashews.',
      55000, 500, 'Gram Flour, Pure Cow Ghee, Sugar Candy (Kalkandu), Cashew Nuts, Raisins, Cardamom', 10,
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      45, TRUE, '10118028000451', CURRENT_TIMESTAMP, 4, TRUE
    ),
    (
      4, 3,
      'Siddhivinayak Pure Ghee Ukadiche & Fried Modak Box',
      'Devotedly crafted Lord Ganesha favorite modaks packed in temperature-regulated, hygienic food-grade tins.',
      40000, 350, 'Rice Flour, Fresh Grated Coconut, Jaggery, Nutmeg, Pure Ghee', 7,
      'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
      30, TRUE, '11521018000892', CURRENT_TIMESTAMP, 4, TRUE
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 6. Seed Sample Bookings (with compliance proof media validation)
  // Booking 1: Completed with photo proof attached
  await query(`
    INSERT INTO bookings (
      id, booking_code, user_id, puja_id, package_id, temple_id,
      scheduled_date, scheduled_time_slot,
      sankalp_name, sankalp_gotra, sankalp_nakshatra, sankalp_rashi, sankalp_intentions,
      consent_data_shared,
      base_amount_paise, addons_amount_paise, platform_fee_paise, tax_paise, total_amount_paise,
      status, proof_media_url, proof_media_type, proof_uploaded_at, proof_uploaded_by, proof_notes
    )
    VALUES
    (
      1, 'BK-KV-2026-9081', 1, 1, 1, 1,
      '2026-10-01', '07:00 AM - 08:00 AM',
      'Kaushal Singh', 'Kashyap', 'Moola', 'Dhanu', 'Health, spiritual progress, family wellbeing',
      TRUE,
      210000, 25000, 5000, 0, 240000,
      'completed',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'photo',
      '2026-10-08T07:00:00.000Z',
      3,
      'Maha Rudrabhishek successfully consecrated in your Gotra with Bilva offering. Recording archived.'
    ),
    (
      2, 'BK-TB-2026-4412', 1, 3, 4, 2,
      '2026-10-15', '09:30 AM - 11:00 AM',
      'Kaushal Singh', 'Kashyap', 'Moola', 'Dhanu', 'Success in upcoming endeavours',
      TRUE,
      310000, 0, 5000, 0, 315000,
      'confirmed',
      NULL, 'none', NULL, NULL, NULL
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 7. Seed Sample Orders with Itemized Breakdown
  await query(`
    INSERT INTO orders (
      id, order_code, user_id,
      base_amount_paise, shipping_fee_paise, platform_fee_paise, tax_paise, total_amount_paise,
      shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code,
      status, tracking_number, courier_partner
    )
    VALUES
    (
      1, 'ORD-SM-2026-1049', 1,
      45000, 5000, 2000, 0, 52000,
      'Kaushal Singh', '+919876543210', 'Plot 42, Ganga Vihar', 'Near Sarnath Cross', 'Varanasi', 'Uttar Pradesh', '221002',
      'paid', 'DELHIVERY-99281920', 'Delhivery Express'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 8. Seed Order Items
  await query(`
    INSERT INTO order_items (
      id, order_id, prasad_item_id, item_name, unit_price_paise, quantity, subtotal_paise, fssai_license_no
    )
    VALUES
    (
      1, 1, 1, 'Kashi Vishwanath Sacred Peda & Dry Fruit Mahaprasad Box',
      45000, 1, 45000, '12723999000142'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 9. Seed Payments with Server-Side Webhook Verification
  await query(`
    INSERT INTO payments (
      id, payment_code, booking_id, user_id,
      amount_paise, currency, gateway, gateway_order_id, gateway_payment_id, gateway_signature,
      verified_server_side, webhook_event_id, signature_verified_at, status
    )
    VALUES
    (
      1, 'PAY-KV-2026-8801', 1, 1,
      240000, 'INR', 'razorpay', 'order_KvZ9812497', 'pay_Kv98104828', 'hmac_sha256_mock_sig_9901',
      TRUE, 'evt_rzp_9812490184', '2026-10-08T07:00:00.000Z', 'captured'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 10. Seed Refund Request
  await query(`
    INSERT INTO refund_requests (
      id, refund_code, user_id, booking_id,
      requested_amount_paise, eligible_amount_paise, deduction_fee_paise,
      reason, policy_tier, cancellation_rules_accepted, status
    )
    VALUES
    (
      1, 'REF-2026-0041', 1, 2,
      315000, 308700, 6300,
      'Family travel delayed due to unforeseen emergency',
      '>48h_full_refund_less_gateway_fee', TRUE, 'requested'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 11. Seed Donation Campaigns (FR-DON-001, FR-DON-008)
  await query(`
    INSERT INTO donation_campaigns (
      id, temple_id, title, description, legal_entity_name,
      target_amount_paise, collected_amount_paise, donors_count, tax_exempt_eligible, tax_exemption_ref, is_active
    )
    VALUES
    (
      1, 1,
      'Maha Annadanam Seva (Daily Free Sacred Meals for 10,000 Devotees)',
      'Providing daily hot, nutritious satvik meals and prasad to pilgrims, sadhus, and underprivileged families along Varanasi ghats.',
      'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
      50000000, 38250000, 342, TRUE, 'SEC-80G-KV-2024-991', TRUE
    ),
    (
      2, 2,
      'Vedic Gaushala & Indigenous Gir Cow Protection Seva',
      'Shelter, organic fodder, veterinary care, and loving protection for over 1,200 rescued indigenous cows and calves at Tirumala foothills.',
      'Tirumala Tirupati Devasthanams (TTD)',
      100000000, 72000000, 512, TRUE, 'SEC-80G-TTD-2023-410', TRUE
    ),
    (
      3, 3,
      'Temple Gopuram Gold Kalash Consecration & Renovation Fund',
      'Historical sanctum preservation, artisanal stonework restoration, and consecration of the 24K gold kalash atop the sanctum sanctorum.',
      'Shree Siddhivinayak Ganapati Temple Trust',
      250000000, 195000000, 880, TRUE, 'SEC-80G-SVT-2022-819', TRUE
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 12. Seed Devotee Donations (FR-DON-001..007, AT-10)
  await query(`
    INSERT INTO donations (
      id, donation_code, user_id, temple_id, campaign_id,
      amount_paise, currency, donor_name, donor_email, donor_phone, donor_pan, status
    )
    VALUES
    (
      1, 'DON-KV-2026-0104', 1, 1, 1,
      510000, 'INR', 'Kaushal Singh', 'kaushal@example.com', '+919876543210', 'ABCDE1234F', 'completed'
    ),
    (
      2, 'DON-TB-2026-0219', 2, 2, 2,
      1100000, 'INR', 'Aarav Sharma', 'aarav@example.com', '+919811122233', 'XYZPK9876L', 'completed'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 13. Seed Verified 80G Receipts (FR-REC-001..006, AT-10)
  await query(`
    INSERT INTO receipts (
      id, receipt_number, donation_id, booking_id, temple_id,
      issuing_legal_entity, tax_exemption_ref, amount_paise, currency, status
    )
    VALUES
    (
      1, 'RCP-KASHI-2026-000104', 1, NULL, 1,
      'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
      '80G(5)(vi) of Income Tax Act 1961 - AABTK1029NF20214',
      510000, 'INR', 'issued'
    ),
    (
      2, 'RCP-TIRUPATI-2026-000219', 2, NULL, 2,
      'Tirumala Tirupati Devasthanams (TTD)',
      '80G(5)(vi) of Income Tax Act 1961 - AAATT4091PF20202',
      1100000, 'INR', 'issued'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 14. Seed Audit Logs (FR-AUD-001..006, AT-12)
  await query(`
    INSERT INTO audit_logs (
      id, actor_user_id, actor_email, actor_role, action, resource_type, resource_id, ip_address, details
    )
    VALUES
    (
      1, 4, 'admin@shirimandir.org', 'admin', 'temple.affiliation_verified',
      'temple', '1', '127.0.0.1', 'Approved official trust MoU for Shri Kashi Vishwanath'
    ),
    (
      2, 4, 'admin@shirimandir.org', 'admin', 'prasad.fssai_verified',
      'prasad_item', '1', '127.0.0.1', 'Verified 14-digit FSSAI license 12723999000142 for Kashi Peda'
    ),
    (
      3, 5, 'superadmin@shirimandir.org', 'super_admin', 'user.role_promoted',
      'user', '4', '127.0.0.1', 'Role confirmed as platform compliance administrator'
    ),
    (
      4, 3, 'priest.kashi@shirimandir.org', 'temple_partner', 'booking.proof_uploaded',
      'booking', '1', '127.0.0.1', 'Uploaded sanctum bilva archana photo proof for BK-KV-2026-9081'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 15. Seed Reconciliation Exceptions (AT-05, AT-06)
  await query(`
    INSERT INTO reconciliation_exceptions (
      id, payment_id, provider, provider_event_id,
      expected_amount_paise, received_amount_paise, exception_type, status, resolution_notes
    )
    VALUES
    (
      1, NULL, 'razorpay', 'evt_rzp_mock_mismatch_001',
      240000, 200000, 'amount_mismatch', 'quarantined',
      'Webhook payload specified ₹2000 instead of expected ₹2400. Isolated in quarantine automatically per AT-05.'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 16. Seed Support Cases (FR-SUP-001..005)
  await query(`
    INSERT INTO support_cases (
      id, ticket_number, tenant_name, requester_email, requester_name,
      subject, category, priority, sla_target_hours, status, assigned_to, resolution_notes
    )
    VALUES
    (
      1, 'CASE-2026-0041', 'Shri Kashi Vishwanath Temple', 'admin@shirikashivishwanath.org', 'Pt. Someshwar Dixit',
      'Devotee UPI payment unconfirmed during Shivaratri surge', 'payment_reconciliation', 'high', 12, 'in_progress',
      'Super Admin (Platform Support)', 'Investigating gateway transaction reference; auto-reconciliation job running.'
    ),
    (
      2, 'CASE-2026-0042', 'Sri Venkateswara Swamy Temple (Tirupati Balaji)', 'trustee@tirupatibalaji.org', 'TTD Secretariat',
      'Renewal of 14-digit FSSAI license for Laddu packaging facility', 'fssai_compliance', 'medium', 24, 'resolved',
      'Compliance Officer', 'Verified renewed statutory license #12423999000219. Verified & prasad status unblocked.'
    ),
    (
      3, 'CASE-2026-0043', 'Shree Siddhivinayak Temple, Mumbai', 'trust@siddhivinayak.org', 'Trust Admin',
      'Custom domain DNS Let''s Encrypt renewal for live.siddhivinayak.org', 'domain_tls', 'high', 8, 'open',
      'DevOps Lead', 'DNS TXT token validated; awaiting automated TLS provisioning trigger.'
    ),
    (
      4, 'CASE-2026-0044', 'Shri Kashi Vishwanath Temple', 'support@shirimandir.org', 'Pooja Deshmukh',
      'Devotee request for rescheduling of Rudrabhishek to Karthik Purnima', 'booking_dispute', 'low', 48, 'resolved',
      'Priest Roster Coordinator', 'Slot moved to 2026-11-15 with devotee consent.'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 17. Seed Controlled Privileged Access Sessions (FR-SEC-001..004)
  await query(`
    INSERT INTO privileged_access_sessions (
      id, session_code, actor_email, target_tenant_name,
      access_level, justification, authorized_by, expires_at, status, ip_address
    )
    VALUES
    (
      1, 'BRK-2026-001', 'superadmin@shirimandir.org', 'Shri Kashi Vishwanath Temple',
      'emergency_break_glass', 'Investigate gateway double-capture reconciliation mismatch during festival rush',
      'Chief Technology Officer (Dual Approval)', '2026-10-16 18:00:00', 'active', '127.0.0.1'
    ),
    (
      2, 'AUD-2026-002', 'compliance.lead@shirimandir.org', 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      'read_only_audit', 'Quarterly 80G tax exemption and financial ledger integrity audit',
      'Internal Audit Board', '2026-10-15 23:59:59', 'expired', '127.0.0.1'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 18. Seed Platform Configuration Management (FR-CFG-001..004)
  await query(`
    INSERT INTO platform_configurations (
      id, config_key, config_value, category, description, is_sensitive, last_modified_by
    )
    VALUES
    (
      1, 'gateway.hmac_enforcement_mode', 'STRICT_ENFORCE', 'security',
      'Drop and isolate webhooks without valid HMAC SHA-256 signatures per AT-05', 0, 'superadmin@shirimandir.org'
    ),
    (
      2, 'fssai.strict_validation_required', 'true', 'compliance',
      'Block publishing of edible prasad items without 14-digit verified license per Rule 2', 0, 'superadmin@shirimandir.org'
    ),
    (
      3, 'rate_limit.max_requests_per_minute', '120', 'traffic',
      'Max API calls per devotee/admin session before rate throttling per FR-AUTH-005', 0, 'superadmin@shirimandir.org'
    ),
    (
      4, 'payment.webhook_retry_max_attempts', '5', 'payments',
      'Maximum retry attempts with exponential backoff before sending to quarantine DLQ', 0, 'superadmin@shirimandir.org'
    ),
    (
      5, 'maintenance.platform_read_only_mode', 'false', 'operations',
      'Emergency switch to put all tenant bookings into read-only darshan queue', 0, 'superadmin@shirimandir.org'
    ),
    (
      6, 'settlement.direct_trust_payout_ratio', '100', 'finance',
      'Percentage of devotee puja & donation revenue settled directly to temple trust bank accounts', 0, 'superadmin@shirimandir.org'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 19. Seed Platform Subscriptions & Direct Settlement (FR-REP-006, FR-AUD-006)
  await query(`
    INSERT INTO platform_subscriptions (
      id, tenant_name, plan_tier, monthly_price_paise, status, next_billing_date, direct_settlement_enabled
    )
    VALUES
    (
      1, 'Shri Kashi Vishwanath Temple', 'vedic_enterprise', 2500000, 'active', '2026-11-01', 1
    ),
    (
      2, 'Sri Venkateswara Swamy Temple (Tirupati Balaji)', 'vedic_enterprise', 2500000, 'active', '2026-11-01', 1
    ),
    (
      3, 'Shree Siddhivinayak Temple, Mumbai', 'gold_mandir', 1200000, 'active', '2026-11-05', 1
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 20. Seed Configurable Alert Rules (FR-ALT-001..004)
  await query(`
    INSERT INTO alert_rules (
      id, name, condition_type, threshold_value, time_window_minutes, severity, is_enabled
    )
    VALUES
    (
      1, 'Payment Webhook Quarantine Spike', 'reconciliation_exceptions_count > 3', 3, 10, 'critical', 1
    ),
    (
      2, 'Failed Login Brute Force Alert', 'failed_auth_attempts > 10', 10, 5, 'warning', 1
    ),
    (
      3, 'Unapproved Prasad Direct Publish Attempt', 'fssai_bypass_attempts > 0', 1, 1, 'critical', 1
    ),
    (
      4, 'Consecrated Volume Daily Target Alert', 'daily_gmv_paise > 5000000', 5000000, 1440, 'info', 1
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  // 21. Resync all primary key sequences in PostgreSQL
  if (getDbEngine() === 'postgresql') {
    try {
      const tables = [
        'users', 'temples', 'pujas', 'puja_packages', 'prasad_items',
        'bookings', 'orders', 'order_items', 'payments', 'refund_requests',
        'donation_campaigns', 'donations', 'receipts', 'audit_logs', 'reconciliation_exceptions',
        'support_cases', 'privileged_access_sessions', 'platform_configurations', 'platform_subscriptions', 'alert_rules'
      ];
      for (const tbl of tables) {
        await query(`SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), COALESCE((SELECT MAX(id) FROM ${tbl}), 1), true);`).catch(() => {});
      }
    } catch (seqErr) {
      console.warn('[SEED] Sequence sync notice:', seqErr.message);
    }
  }

  console.log('[SEED] Database successfully seeded with 3 compliant temples, pujas, packages, FSSAI prasad items, verified bookings, itemized orders, donation campaigns, verified 80G receipts, audit logs, and reconciliation exceptions.');
}

// Direct execution when run via `node src/database/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
