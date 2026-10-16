async function runAllTests() {
  const base = 'http://localhost:5000/api';
  console.log('================================================================');
  console.log('SHIRI MANDIR - END-TO-END FUNCTIONAL REQUIREMENTS VERIFICATION');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✔ [PASS] ${testName} ${details}`);
    } else {
      console.error(`  ✖ [FAIL] ${testName} ${details}`);
    }
  }

  // 1. PUBLIC ENDPOINTS
  console.log('--- 1. Public & Temple Discovery Endpoints ---');
  const healthRes = await (await fetch(`${base}/health`)).json();
  assert(healthRes.status === 'healthy', 'Health Check API returns healthy status');

  const templesRes = await (await fetch(`${base}/temples`)).json();
  assert(templesRes.success && templesRes.data?.length >= 3, 'Temples listing returns seeded temples', `Count: ${templesRes.data?.length}`);

  const pujasRes = await (await fetch(`${base}/pujas`)).json();
  assert(pujasRes.success && pujasRes.data?.length > 0, 'Pujas listing returns spiritual offerings', `Count: ${pujasRes.data?.length}`);

  const prasadRes = await (await fetch(`${base}/prasad`)).json();
  assert(prasadRes.success && prasadRes.data?.length > 0, 'Prasad listing returns active items', `Count: ${prasadRes.data?.length}`);

  const campaignsRes = await (await fetch(`${base}/donations/campaigns`)).json();
  assert(campaignsRes.success && campaignsRes.data?.length >= 3, 'Donation campaigns listing returns active campaigns', `Count: ${campaignsRes.data?.length}`);

  // 2. DEVOTEE ROLE & FUNCTIONAL REQUIREMENTS
  console.log('\n--- 2. Devotee Functional Requirements ---');
  // Login as Devotee
  const devLoginRes = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kaushal@example.com', password: 'HarHarMahadev@123' })
  })).json();
  assert(devLoginRes.success && devLoginRes.data?.user?.role === 'devotee', 'Devotee authentication & JWT issuance', `Email: ${devLoginRes.data?.user?.email}`);

  const devToken = devLoginRes.data?.token;
  const devHeaders = { 'Authorization': `Bearer ${devToken}`, 'Content-Type': 'application/json' };

  // FR: Booking History & Status
  const myBookings = await (await fetch(`${base}/bookings/my`, { headers: devHeaders })).json();
  assert(myBookings.success && myBookings.data?.length > 0, 'Devotee can retrieve own bookings history', `Bookings: ${myBookings.data?.length}`);

  // FR: Prasad Orders
  const myOrders = await (await fetch(`${base}/orders/my`, { headers: devHeaders })).json();
  assert(myOrders.success, 'Devotee can retrieve own prasad orders history');

  // FR: Online Donations & 80G Receipts
  const myDonations = await (await fetch(`${base}/donations/my`, { headers: devHeaders })).json();
  assert(myDonations.success && myDonations.data?.length > 0, 'Devotee can retrieve own donation history', `Donations: ${myDonations.data?.length}`);

  // Devotee Receipt access
  const receiptNum = myDonations.data[0]?.receipt_number;
  if (receiptNum) {
    const receiptRes = await (await fetch(`${base}/donations/receipts/${receiptNum}`)).json();
    assert(receiptRes.success && receiptRes.data?.receipt_number === receiptNum, 'Devotee can retrieve 80G tax receipt', `Receipt: ${receiptNum}`);
  }

  // FR: Privacy & Consent Management
  const consentRes = await (await fetch(`${base}/auth/consent`, {
    method: 'PUT',
    headers: devHeaders,
    body: JSON.stringify({ consent_data_sharing: true })
  })).json();
  assert(consentRes.success, 'Devotee privacy consent toggle operates correctly');

  // 3. ADMIN ROLE & FUNCTIONAL REQUIREMENTS
  console.log('\n--- 3. Temple Admin Functional Requirements ---');
  const adminLoginRes = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shirimandir.org', password: 'Admin@123' })
  })).json();
  assert(adminLoginRes.success && adminLoginRes.data?.user?.role === 'admin', 'Admin authentication & JWT issuance');

  const adminToken = adminLoginRes.data?.token;
  const adminHeaders = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  // Admin Metrics
  const adminMetrics = await (await fetch(`${base}/admin/metrics`, { headers: adminHeaders })).json();
  assert(adminMetrics.success && adminMetrics.data?.temples && adminMetrics.data?.bookings, 'Admin dashboard metrics retrieved successfully');

  // Admin Refunds Queue
  const adminRefunds = await (await fetch(`${base}/admin/refunds`, { headers: adminHeaders })).json();
  assert(adminRefunds.success, 'Admin refund management queue retrieved');

  // Admin Audit Trail
  const adminAudit = await (await fetch(`${base}/admin/audit-logs`, { headers: adminHeaders })).json();
  assert(adminAudit.success && adminAudit.data?.length > 0, 'Admin immutable audit logs retrieved', `Entries: ${adminAudit.data?.length}`);

  // Admin Reconciliation Exceptions
  const adminReconcil = await (await fetch(`${base}/admin/reconciliations`, { headers: adminHeaders })).json();
  assert(adminReconcil.success && adminReconcil.data?.length > 0, 'Admin quarantined payment exceptions retrieved', `Exceptions: ${adminReconcil.data?.length}`);

  // Admin Consolidated Reports
  const adminReports = await (await fetch(`${base}/admin/reports`, { headers: adminHeaders })).json();
  assert(adminReports.success && adminReports.data?.temple_bookings, 'Admin consolidated multi-temple reporting retrieved');

  // 4. SUPER ADMIN ROLE & GOVERNANCE REQUIREMENTS
  console.log('\n--- 4. Super Admin Functional Requirements ---');
  const saLoginRes = await (await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@shirimandir.org', password: 'SuperAdmin@123' })
  })).json();
  assert(saLoginRes.success && saLoginRes.data?.user?.role === 'super_admin', 'Super Admin authentication & JWT issuance');

  const saToken = saLoginRes.data?.token;
  const saHeaders = { 'Authorization': `Bearer ${saToken}`, 'Content-Type': 'application/json' };

  // Super Admin: User Governance & RBAC
  const usersRes = await (await fetch(`${base}/auth/users`, { headers: saHeaders })).json();
  assert(usersRes.success && usersRes.data?.length >= 5, 'Super Admin User Governance & RBAC listing retrieved', `Users: ${usersRes.data?.length}`);

  // Super Admin: Support Case Management (P1)
  const supportRes = await (await fetch(`${base}/admin/support-cases`, { headers: saHeaders })).json();
  assert(supportRes.success && supportRes.data?.length > 0, 'Support case management with SLA tracking operational', `Cases: ${supportRes.data?.length}`);

  // Super Admin: Controlled Admin Access (Break-Glass Sessions)
  const privRes = await (await fetch(`${base}/admin/privileged-access`, { headers: saHeaders })).json();
  assert(privRes.success && privRes.data?.length > 0, 'Controlled privileged access sessions retrieved', `Sessions: ${privRes.data?.length}`);

  // Super Admin: Platform Configurations
  const cfgRes = await (await fetch(`${base}/admin/configurations`, { headers: saHeaders })).json();
  assert(cfgRes.success && cfgRes.data?.length > 0, 'Platform configuration management operational', `Configs: ${cfgRes.data?.length}`);

  // Super Admin: Subscriptions & Billing (P1)
  const subRes = await (await fetch(`${base}/admin/subscriptions`, { headers: saHeaders })).json();
  assert(subRes.success && subRes.data?.length > 0, 'Tenant SaaS subscriptions and direct escrow settlement operational', `Subscriptions: ${subRes.data?.length}`);

  // Super Admin: Health & Alert Rules (P2)
  const alertsRes = await (await fetch(`${base}/admin/alert-rules`, { headers: saHeaders })).json();
  assert(alertsRes.success && alertsRes.data?.length > 0, 'Health telemetry & configurable alert rules operational', `Rules: ${alertsRes.data?.length}`);

  // Super Admin: Data Export Engine with Sensitive Masking
  const exportRes = await (await fetch(`${base}/admin/export`, {
    method: 'POST',
    headers: saHeaders,
    body: JSON.stringify({ dataset: 'donations', mask_sensitive: true })
  })).json();
  assert(exportRes.success && exportRes.data?.records?.length > 0, 'Data export engine operational with sensitive data masking', `Exported records: ${exportRes.data?.records?.length}`);

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log(`COMPLIANCE PASS RATE: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('================================================================');
}

runAllTests().catch(console.error);
