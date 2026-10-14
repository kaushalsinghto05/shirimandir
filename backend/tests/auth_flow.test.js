import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'node:http';
import app from '../src/app.js';
import { query, initDb } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';
import { config } from '../src/config/index.js';

let server;
let baseUrl;

before(async () => {
  await initDb();
  await seedDatabase();

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
});

describe('Authentication, RBAC & Profile Flow Suite', () => {
  const testDevoteeEmail = `devotee_${Date.now()}@test.org`;
  const testPassword = 'SecurePassword123';
  let devoteeToken = '';
  let devoteeId = null;

  test('1. Registration validation: Rejects invalid email format', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: testPassword })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /valid email/i);
  });

  test('2. Registration validation: Rejects password under 8 characters', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `valid_${Date.now()}@test.org`, password: 'short' })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /at least 8 characters/i);
  });

  test('3. Registration success: Defaults to devotee role, profile_completed = false, bcrypt hash, and valid JWT', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testDevoteeEmail, password: testPassword })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token, 'JWT token issued');
    assert.equal(body.data.user.role, 'devotee', 'Default role must be devotee');
    assert.equal(body.data.user.profile_completed, false, 'Default profile_completed must be false');

    devoteeToken = body.data.token;
    devoteeId = body.data.user.id;

    // Verify in database that password was hashed with bcrypt
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [devoteeId]);
    assert.ok(rows[0].password_hash, 'Password hash exists in DB');
    assert.notEqual(rows[0].password_hash, testPassword, 'Password must never be stored in plain text');
    assert.ok(await bcrypt.compare(testPassword, rows[0].password_hash), 'Bcrypt verification must succeed');
  });

  test('4. Login: Validates credentials and returns session token with user info', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testDevoteeEmail, password: testPassword })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, testDevoteeEmail);
    assert.equal(body.data.user.role, 'devotee');
    assert.equal(body.data.user.profile_completed, false);
  });

  test('5. Complete Profile: Sets profile_completed = true and updates devotee details', async () => {
    const res = await fetch(`${baseUrl}/auth/complete-profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${devoteeToken}`
      },
      body: JSON.stringify({
        name: 'Ramesh Sharma',
        phone: '+91 91234 56789',
        gotra: 'Bharadwaj',
        rashi: 'Kanya',
        nakshatra: 'Hasta',
        consent_data_sharing: true
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.profile_completed, true, 'profile_completed must now be true');
    assert.equal(body.data.user.name, 'Ramesh Sharma');
    assert.ok(body.data.token, 'Fresh JWT token re-issued with profile_completed: true');
  });

  test('6. RBAC Backend Guard: Devotee cannot access admin routes (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/admin/metrics`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${devoteeToken}` }
    });

    assert.equal(res.status, 403, 'Devotee must receive 403 Forbidden on admin metrics');
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Forbidden/i);
  });

  test('7. RBAC Backend Guard: Devotee cannot access super-admin routes (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/auth/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${devoteeToken}` }
    });

    assert.equal(res.status, 403, 'Devotee must receive 403 Forbidden on super admin user management');
  });

  test('8. RBAC Backend Guard: Missing or expired token receives 401 Unauthorized', async () => {
    const resNoToken = await fetch(`${baseUrl}/auth/me`, { method: 'GET' });
    assert.equal(resNoToken.status, 401);

    const expiredToken = jwt.sign(
      { userId: devoteeId, role: 'devotee', email: testDevoteeEmail },
      config.jwtSecret,
      { expiresIn: '-10s' }
    );

    const resExpired = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    });
    assert.equal(resExpired.status, 401);
  });

  test('9. Super Admin: Can list users, create admins, and update roles', async () => {
    // Login as seeded super admin
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@shirimandir.org', password: 'HarHarMahadev@123' })
    });

    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    const superAdminToken = loginBody.data.token;
    assert.equal(loginBody.data.user.role, 'super_admin');

    // List users
    const usersRes = await fetch(`${baseUrl}/auth/users`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    assert.equal(usersRes.status, 200);
    const usersBody = await usersRes.json();
    assert.ok(Array.isArray(usersBody.data));

    // Create an admin
    const newAdminEmail = `admin_${Date.now()}@shirimandir.org`;
    const createAdminRes = await fetch(`${baseUrl}/auth/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Mandir Manager',
        email: newAdminEmail,
        password: 'AdminPassword123'
      })
    });

    assert.equal(createAdminRes.status, 201);
    const createAdminBody = await createAdminRes.json();
    assert.equal(createAdminBody.data.role, 'admin');

    // Promote devotee to admin
    const roleChangeRes = await fetch(`${baseUrl}/auth/users/${devoteeId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ role: 'admin' })
    });

    assert.equal(roleChangeRes.status, 200);
    const roleChangeBody = await roleChangeRes.json();
    assert.equal(roleChangeBody.data.role, 'admin');
  });
});
