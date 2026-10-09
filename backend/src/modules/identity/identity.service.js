import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../database/db.js';
import { config } from '../../config/index.js';

export class IdentityService {
  /**
   * Register a new devotee user
   */
  async registerUser({
    name,
    email,
    password,
    phone,
    gotra,
    rashi,
    nakshatra,
    consent_data_sharing = false,
    role = 'devotee',
    ipAddress = '127.0.0.1'
  }) {
    if (!name || !email || !password) {
      throw { status: 400, message: 'Name, email, and password are mandatory fields' };
    }

    const assignedRole = role === 'admin' ? 'devotee' : (['temple_partner', 'devotee'].includes(role) ? role : 'devotee');

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      throw { status: 409, message: 'An account with this email address already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
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

    return {
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
    };
  }

  /**
   * Authenticate devotee and generate JWT
   */
  async loginUser({ email, password }) {
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required' };
    }

    const { rows } = await query(
      'SELECT id, name, email, password_hash, phone, role, gotra, rashi, nakshatra, consent_data_sharing FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });

    return {
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
    };
  }

  /**
   * Update consent preference
   */
  async updateConsent(userId, consent_data_sharing, ipAddress = '127.0.0.1') {
    if (typeof consent_data_sharing !== 'boolean') {
      throw { status: 400, message: 'consent_data_sharing must be a boolean (true/false)' };
    }

    const timestamp = new Date().toISOString();

    await query(
      `UPDATE users 
       SET consent_data_sharing = $1, 
           consent_timestamp = $2, 
           consent_ip_address = $3 
       WHERE id = $4`,
      [consent_data_sharing ? 1 : 0, timestamp, ipAddress, userId]
    );

    return {
      consent_data_sharing,
      consent_timestamp: timestamp
    };
  }

  /**
   * Get user by ID (for inter-module queries)
   */
  async getUserById(userId) {
    const { rows } = await query(
      'SELECT id, name, email, phone, role, gotra, rashi, nakshatra, consent_data_sharing FROM users WHERE id = $1',
      [userId]
    );
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      consent_data_sharing: Boolean(rows[0].consent_data_sharing)
    };
  }
}

export const identityService = new IdentityService();
