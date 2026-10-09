import { identityService } from './identity.service.js';

export async function register(req, res, next) {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const result = await identityService.registerUser({
      ...req.body,
      ipAddress
    });

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered with privacy preferences recorded',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await identityService.loginUser(req.body);
    return res.json({
      success: true,
      message: 'Authentication successful',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
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

export async function updateConsent(req, res, next) {
  try {
    const { consent_data_sharing } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const result = await identityService.updateConsent(req.user.id, consent_data_sharing, ipAddress);

    return res.json({
      success: true,
      message: consent_data_sharing
        ? 'Explicit consent granted: Temple priests can now receive your gotra & name for chanting sankalp.'
        : 'Consent withdrawn: Your identity will remain anonymized during external temple ceremonies.',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
  }
}
