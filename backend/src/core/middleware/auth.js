import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { query } from '../../database/db.js';

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
      `SELECT id, name, email, phone, role, gotra, rashi, nakshatra, 
              consent_data_sharing, profile_completed 
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User account no longer exists'
      });
    }

    const user = rows[0];
    req.user = {
      ...user,
      profile_completed: Boolean(user.profile_completed),
      consent_data_sharing: Boolean(user.consent_data_sharing)
    };
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
 * Supported roles: 'devotee', 'admin', 'super_admin', 'temple_partner'
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
 * Guard ensuring devotee has completed their profile
 */
export function requireProfileCompleted(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Please authenticate first'
    });
  }

  if (!req.user.profile_completed) {
    return res.status(403).json({
      success: false,
      error: 'Profile incomplete: Please complete your profile at /complete-profile before proceeding.',
      profile_completed: false
    });
  }

  next();
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
      `SELECT id, name, email, phone, role, gotra, rashi, nakshatra, 
              consent_data_sharing, profile_completed 
       FROM users WHERE id = $1`,
      [decoded.userId]
    );
    if (rows.length > 0) {
      req.user = {
        ...rows[0],
        profile_completed: Boolean(rows[0].profile_completed),
        consent_data_sharing: Boolean(rows[0].consent_data_sharing)
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}
