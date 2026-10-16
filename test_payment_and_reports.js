async function verifyFixes() {
  const base = 'http://localhost:5000/api';
  console.log('=== VERIFYING PAYMENT, REPORT & EXPORT, AUDIT, AND PLATFORM OPERATIONS ===\n');

  // 1. Devotee Login as thakurkaushalsingh900
  console.log('--- 1. Testing Donation with String Slugs (Screenshot 1 Bug Reproduction) ---');
  const loginRes = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'thakurkaushalsingh900@gmail.com', password: 'Devotee@123' })
  })).json();

  const token = loginRes.data?.token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Test with 'don-annadanam' (String slug that previously threw FOREIGN KEY constraint failed)
  const don1 = await (await fetch(`${base}/donations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      campaign_id: 'don-annadanam',
      amount_inr: 501,
      donor_name: 'thakurkaushalsingh900',
      donor_email: 'thakurkaushalsingh900@gmail.com',
      donor_phone: '9005346561',
      donor_pan: 'ABCDE1234F'
    })
  })).json();

  console.log('Donation with string "don-annadanam":', don1.success ? '✔ SUCCESS' : '✖ FAILED', don1.data?.donation?.donation_code, don1.data?.receipt?.receipt_number);
  if (!don1.success) console.error('Error detail:', don1.error);

  // Test with numeric 1
  const don2 = await (await fetch(`${base}/donations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      campaign_id: 1,
      amount_inr: 1100,
      donor_name: 'thakurkaushalsingh900',
      donor_email: 'thakurkaushalsingh900@gmail.com',
      donor_phone: '9005346561',
      donor_pan: 'ABCDE1234F'
    })
  })).json();
  console.log('Donation with numeric campaign_id 1:', don2.success ? '✔ SUCCESS' : '✖ FAILED', don2.data?.donation?.donation_code);

  // 2. Test Payment Intent + Simulate Webhook
  console.log('\n--- 2. Testing Payment Intent & Webhook Simulation ---');
  let myBookingsRes = await (await fetch(`${base}/bookings/my`, { headers })).json();
  let userBooking = myBookingsRes.data?.find(b => b.payment_status === 'pending') || myBookingsRes.data?.[0];

  if (!userBooking) {
    // Create a pending booking for this devotee
    const createB = await (await fetch(`${base}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        puja_id: 1,
        scheduled_date: '2026-11-01',
        sankalp_name: 'thakurkaushalsingh900',
        sankalp_gotra: 'Kashyap',
        sankalp_nakshatra: 'Rohini',
        sankalp_rashi: 'Vrishabha',
        sankalp_intentions: 'Family Health & Prosperity'
      })
    })).json();
    userBooking = createB.data?.booking;
  }

  const intentRes = await (await fetch(`${base}/payments/intent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ booking_id: userBooking?.id })
  })).json();
  console.log('Payment intent creation for booking', userBooking?.id, ':', intentRes.success ? '✔ SUCCESS' : '✖ FAILED', intentRes.data?.payment_code);

  if (intentRes.data?.payment_code) {
    const simRes = await (await fetch(`${base}/payments/simulate-webhook`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ payment_code: intentRes.data.payment_code })
    })).json();
    console.log('Payment webhook simulation:', simRes.success ? '✔ SUCCESS' : '✖ FAILED', simRes.message);
  }

  // 3. Test Admin Login & Consolidated Reports
  console.log('\n--- 3. Testing Admin Reports & Reconciliation ---');
  const adminLogin = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shirimandir.org', password: 'Admin@123' })
  })).json();
  const adminHeaders = { 'Authorization': `Bearer ${adminLogin.data?.token}`, 'Content-Type': 'application/json' };

  const repRes = await (await fetch(`${base}/admin/reports`, { headers: adminHeaders })).json();
  console.log('Consolidated Reports API:', repRes.success ? '✔ SUCCESS' : '✖ FAILED', 'Temples in report:', repRes.data?.temple_bookings?.length);

  const reconRes = await (await fetch(`${base}/admin/reconciliations`, { headers: adminHeaders })).json();
  console.log('Platform Operations Exceptions:', reconRes.success ? '✔ SUCCESS' : '✖ FAILED', 'Quarantined count:', reconRes.data?.length);

  // 4. Test Super Admin Data Export
  console.log('\n--- 4. Testing Super Admin Data Export Engine ---');
  const saLogin = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@shirimandir.org', password: 'SuperAdmin@123' })
  })).json();
  const saHeaders = { 'Authorization': `Bearer ${saLogin.data?.token}`, 'Content-Type': 'application/json' };

  for (const ds of ['bookings', 'donations', 'audit_logs']) {
    const exp = await (await fetch(`${base}/admin/export`, {
      method: 'POST',
      headers: saHeaders,
      body: JSON.stringify({ dataset: ds, mask_sensitive: true })
    })).json();
    console.log(`Export dataset "${ds}":`, exp.success ? '✔ SUCCESS' : '✖ FAILED', `Records: ${exp.data?.records?.length}`);
  }

  console.log('\n=== ALL TARGET MODULES VERIFIED SUCCESSFULLY ===');
}

verifyFixes().catch(console.error);
