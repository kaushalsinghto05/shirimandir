import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/index.js';

test('Token Expiration & Re-authentication Flow', async (t) => {
  const testSecret = config.jwtSecret;

  await t.test('1. Valid token is recognized and not expired', () => {
    const validToken = jwt.sign(
      { userId: 1, role: 'admin', profile_completed: true },
      testSecret,
      { expiresIn: '1h' }
    );
    const decoded = jwt.decode(validToken);
    assert.ok(decoded.exp);
    const isExpired = decoded.exp * 1000 <= Date.now();
    assert.strictEqual(isExpired, false, 'Fresh token must not be expired');
  });

  await t.test('2. Expired token is detected by timestamp and rejected', () => {
    // Expired 1 hour ago
    const expiredToken = jwt.sign(
      { userId: 1, role: 'admin', profile_completed: true, iat: Math.floor(Date.now() / 1000) - 7200 },
      testSecret,
      { expiresIn: '1s' }
    );
    const decoded = jwt.decode(expiredToken);
    const isExpired = decoded.exp * 1000 <= Date.now();
    assert.strictEqual(isExpired, true, 'Token expired in the past must be detected as expired');

    // jwt.verify should throw TokenExpiredError
    assert.throws(
      () => jwt.verify(expiredToken, testSecret),
      (err) => err.name === 'TokenExpiredError'
    );
  });

  await t.test('3. Calling backend /api/auth/me with expired token returns 401', async () => {
    const expiredToken = jwt.sign(
      { userId: 1, role: 'admin', profile_completed: true, iat: Math.floor(Date.now() / 1000) - 7200 },
      testSecret,
      { expiresIn: '1s' }
    );

    const res = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    });

    assert.strictEqual(res.status, 401, 'Backend must return 401 for expired token');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.error, /Unauthorized/);
  });

  await t.test('4. Re-logging in produces a fresh valid token and restores dashboard access', async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shirimandir.org',
        password: 'HarHarMahadev@123'
      })
    });

    assert.strictEqual(res.status, 200, 'Login must succeed');
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.token, 'Must return fresh JWT token');

    const freshToken = data.data.token;
    const verifyRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${freshToken}`
      }
    });

    assert.strictEqual(verifyRes.status, 200, 'Fresh token must verify successfully on /api/auth/me');
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.success, true);
    assert.strictEqual(verifyData.data.role, 'admin');
    assert.strictEqual(verifyData.data.profile_completed, true);
  });
});
