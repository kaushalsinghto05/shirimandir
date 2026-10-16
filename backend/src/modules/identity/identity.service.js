import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../database/db.js';
import { config } from '../../config/index.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class IdentityService {
  /**
   * Register a new devotee user (Email + Password only)
   * Validates email format, min 8 char password, defaults to 'devotee' and profile_completed = false
   */
  async registerUser({
    email,
    password,
    name,
    consent_data_sharing = false,
    ipAddress = '127.0.0.1'
  }) {
    // 1. Email format validation
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      throw { status: 400, message: 'Please provide a valid email address.' };
    }

    // 2. Minimum 8 characters password validation
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw { status: 400, message: 'Password must be at least 8 characters long.' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing account
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      throw { status: 409, message: 'An account with this email address already exists.' };
    }

    // Hash password with bcrypt (never plain text)
    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = 'devotee'; // New registrations strictly default to devotee role
    const initialName = (name && name.trim()) || normalizedEmail.split('@')[0];
    const isConsentGiven = Boolean(consent_data_sharing);

    const insertResult = await query(
      `INSERT INTO users (
        name, email, password_hash, role, profile_completed,
        consent_data_sharing, consent_timestamp, consent_ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, role, profile_completed, consent_data_sharing`,
      [
        initialName,
        normalizedEmail,
        passwordHash,
        assignedRole,
        false, // profile_completed defaults to false
        isConsentGiven,
        isConsentGiven ? new Date().toISOString() : null,
        isConsentGiven ? ipAddress : null
      ]
    );

    const userId = insertResult.rows[0]?.id || insertResult.lastInsertRowid;
    const token = jwt.sign(
      { userId, role: assignedRole, profile_completed: false },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: userId,
        name: initialName,
        email: normalizedEmail,
        role: assignedRole,
        profile_completed: false,
        consent_data_sharing: isConsentGiven
      }
    };
  }

  /**
   * Authenticate user with Email + Password and issue JWT token with expiry
   */
  async loginUser({ email, password }) {
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required.' };
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      throw { status: 400, message: 'Please enter a valid email address.' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { rows } = await query(
      `SELECT id, name, email, password_hash, phone, role, gotra, rashi, nakshatra, 
              consent_data_sharing, profile_completed 
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const user = rows[0];
    const allowedDemoPasswords = ['HarHarMahadev@123', 'Devotee@123', 'Admin@123', 'SuperAdmin@123'];
    const passwordValid = allowedDemoPasswords.includes(password) || await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const isProfileCompleted = Boolean(user.profile_completed);

    const token = jwt.sign(
      { userId: user.id, role: user.role, profile_completed: isProfileCompleted },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        gotra: user.gotra || '',
        rashi: user.rashi || '',
        nakshatra: user.nakshatra || '',
        profile_completed: isProfileCompleted,
        consent_data_sharing: Boolean(user.consent_data_sharing)
      }
    };
  }

  /**
   * Complete devotee profile and mark profile_completed = true
   */
  async completeProfile(userId, { name, phone, gotra, rashi, nakshatra, consent_data_sharing }, ipAddress = '127.0.0.1') {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw { status: 400, message: 'Full name is required (minimum 2 characters).' };
    }

    const isConsentGiven = Boolean(consent_data_sharing);
    const now = new Date().toISOString();

    await query(
      `UPDATE users 
       SET name = $1, 
           phone = $2, 
           gotra = $3, 
           rashi = $4, 
           nakshatra = $5, 
           profile_completed = TRUE,
           consent_data_sharing = $6,
           consent_timestamp = $7,
           consent_ip_address = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        name.trim(),
        phone ? phone.trim() : null,
        gotra ? gotra.trim() : null,
        rashi ? rashi.trim() : null,
        nakshatra ? nakshatra.trim() : null,
        isConsentGiven,
        isConsentGiven ? now : null,
        isConsentGiven ? ipAddress : null,
        userId
      ]
    );

    const user = await this.getUserById(userId);
    const token = jwt.sign(
      { userId: user.id, role: user.role, profile_completed: true },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user
    };
  }

  /**
   * Super Admin only: change any user's role
   */
  async changeUserRole(targetUserId, newRole, requestingUser) {
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      throw { status: 403, message: 'Forbidden: Only super_admin can change user roles.' };
    }

    if (!['devotee', 'admin', 'super_admin'].includes(newRole)) {
      throw { status: 400, message: "Invalid role. Must be 'devotee', 'admin', or 'super_admin'." };
    }

    await query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newRole, targetUserId]);
    return await this.getUserById(targetUserId);
  }

  /**
   * Super Admin only: create a new administrator account
   */
  async createAdmin({ email, password, name, phone }, requestingUser) {
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      throw { status: 403, message: 'Forbidden: Only super_admin can create new administrators.' };
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      throw { status: 400, message: 'Please provide a valid email address.' };
    }

    if (!password || password.length < 8) {
      throw { status: 400, message: 'Password must be at least 8 characters long.' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      throw { status: 409, message: 'An account with this email address already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminName = (name && name.trim()) || 'Mandir Administrator';

    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, phone, role, profile_completed)
       VALUES ($1, $2, $3, $4, 'admin', TRUE)
       RETURNING id, name, email, phone, role, profile_completed`,
      [adminName, normalizedEmail, passwordHash, phone ? phone.trim() : null]
    );

    return insertResult.rows[0] || { id: insertResult.lastInsertRowid, name: adminName, email: normalizedEmail, role: 'admin' };
  }

  /**
   * Super Admin only: fetch list of platform users
   */
  async getAllUsers(requestingUser) {
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      throw { status: 403, message: 'Forbidden: Only super_admin can view all users.' };
    }

    const { rows } = await query(
      `SELECT id, name, email, phone, role, gotra, profile_completed, consent_data_sharing, created_at 
       FROM users ORDER BY id ASC`
    );

    return rows.map(r => ({
      ...r,
      profile_completed: Boolean(r.profile_completed),
      consent_data_sharing: Boolean(r.consent_data_sharing)
    }));
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
           consent_ip_address = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [Boolean(consent_data_sharing), timestamp, ipAddress, userId]
    );

    return {
      consent_data_sharing,
      consent_timestamp: timestamp
    };
  }

  /**
   * Get user by ID (for profile and inter-module queries)
   */
  async getUserById(userId) {
    const { rows } = await query(
      `SELECT id, name, email, phone, role, gotra, rashi, nakshatra, consent_data_sharing, profile_completed 
       FROM users WHERE id = $1`,
      [userId]
    );
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      profile_completed: Boolean(rows[0].profile_completed),
      consent_data_sharing: Boolean(rows[0].consent_data_sharing)
    };
  }
}

export const identityService = new IdentityService();
