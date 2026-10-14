import { identityService } from './identity.service.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});

export async function register(req, res, next) {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const result = await identityService.registerUser({
      ...req.body,
      ipAddress
    });

    res.cookie('shirimandir_token', result.token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered with devotee role',
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
    res.cookie('shirimandir_token', result.token, getCookieOptions());

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
  const user = {
    ...req.user,
    profile_completed: Boolean(req.user.profile_completed),
    consent_data_sharing: Boolean(req.user.consent_data_sharing)
  };
  return res.json({
    success: true,
    data: {
      user,
      ...user
    }
  });
}

export async function completeProfile(req, res, next) {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const result = await identityService.completeProfile(req.user.id, req.body, ipAddress);

    if (result.token) {
      res.cookie('shirimandir_token', result.token, getCookieOptions());
    }

    return res.json({
      success: true,
      message: 'Profile completed successfully. You may now access your dashboard.',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
  }
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

export async function changeUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await identityService.changeUserRole(Number(id), role, req.user);

    return res.json({
      success: true,
      message: `User #${id} role successfully updated to ${role}`,
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
  }
}

export async function createAdmin(req, res, next) {
  try {
    const result = await identityService.createAdmin(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: 'Administrator account successfully created',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const result = await identityService.getAllUsers(req.user);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return next(err);
  }
}
