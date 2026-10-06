import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { query } from '../database/db.js';

/**
 * JWT Authentication Middleware
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // Retrieve fresh user record
    const { rows } = await query(
      'SELECT id, name, email, phone, role, gotra, rashi, nakshatra, consent_data_sharing FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User account no longer exists'
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired session token',
      details: err.message
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Guard
 * Roles: 'devotee', 'temple_partner', 'admin'
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Please authenticate first'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
}

/**
 * Optional Authentication (attaches req.user if provided, otherwise continues)
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const { rows } = await query(
      'SELECT id, name, email, phone, role, gotra, rashi, nakshatra, consent_data_sharing FROM users WHERE id = $1',
      [decoded.userId]
    );
    req.user = rows.length > 0 ? rows[0] : null;
  } catch {
    req.user = null;
  }
  next();
}
