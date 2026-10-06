import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';
import { config } from '../config/index.js';

export async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      gotra,
      rashi,
      nakshatra,
      consent_data_sharing = false,
      role = 'devotee'
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are mandatory fields'
      });
    }

    // Role safety: devotees cannot self-register as admin
    const assignedRole = role === 'admin' ? 'devotee' : (['temple_partner', 'devotee'].includes(role) ? role : 'devotee');

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    // COMPLIANCE: users.consent_data_sharing defaults to false unless explicitly opted in
    const isConsentGiven = Boolean(consent_data_sharing);

    const insertResult = await query(
      `INSERT INTO users (
        name, email, password_hash, phone, role, gotra, rashi, nakshatra,
        consent_data_sharing, consent_timestamp, consent_ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, phone, role, gotra, rashi, nakshatra, consent_data_sharing`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        phone || null,
        assignedRole,
        gotra || null,
        rashi || null,
        nakshatra || null,
        isConsentGiven ? 1 : 0,
        isConsentGiven ? new Date().toISOString() : null,
        isConsentGiven ? ipAddress : null
      ]
    );

    const userId = insertResult.rows[0]?.id || insertResult.lastInsertRowid;
    const token = jwt.sign({ userId, role: assignedRole }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered with privacy preferences recorded',
      data: {
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone,
          role: assignedRole,
          gotra,
          rashi,
          nakshatra,
          consent_data_sharing: isConsentGiven
        }
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { rows } = await query(
      'SELECT id, name, email, password_hash, phone, role, gotra, rashi, nakshatra, consent_data_sharing FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    return res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          gotra: user.gotra,
          rashi: user.rashi,
          nakshatra: user.nakshatra,
          consent_data_sharing: Boolean(user.consent_data_sharing)
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getProfile(req, res) {
  return res.json({
    success: true,
    data: {
      user: {
        ...req.user,
        consent_data_sharing: Boolean(req.user.consent_data_sharing)
      }
    }
  });
}

/**
 * COMPLIANCE ENDPOINT: Devotee Data Privacy Preference Control
 * Allows devotees to toggle or audit their consent to share ritual details with temple partners
 */
export async function updateConsent(req, res) {
  try {
    const { consent_data_sharing } = req.body;
    if (typeof consent_data_sharing !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'consent_data_sharing must be a boolean (true/false)'
      });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const timestamp = new Date().toISOString();

    await query(
      `UPDATE users 
       SET consent_data_sharing = $1, 
           consent_timestamp = $2, 
           consent_ip_address = $3 
       WHERE id = $4`,
      [consent_data_sharing ? 1 : 0, timestamp, ipAddress, req.user.id]
    );

    return res.json({
      success: true,
      message: consent_data_sharing
        ? 'Explicit consent granted: Temple priests can now receive your gotra & name for chanting sankalp.'
        : 'Consent withdrawn: Your identity will remain anonymized during external temple ceremonies.',
      data: {
        consent_data_sharing,
        consent_timestamp: timestamp
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
