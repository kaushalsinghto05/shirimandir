import { templeService } from './temple.service.js';
import { getPublicMediaUrl } from '../../core/storage/storageService.js';

export async function getAllTemples(req, res, next) {
  try {
    const temples = await templeService.getTemples(req.query);
    return res.json({
      success: true,
      count: temples.length,
      data: temples
    });
  } catch (err) {
    next(err);
  }
}

export async function getTempleBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const temple = await templeService.getTempleBySlug(slug);

    if (!temple) {
      return res.status(404).json({
        success: false,
        error: `Temple not found for slug '${slug}'`
      });
    }

    return res.json({
      success: true,
      data: temple
    });
  } catch (err) {
    next(err);
  }
}

export async function createTemple(req, res, next) {
  try {
    let affiliationDocUrl = req.body.affiliation_proof_doc || null;
    if (req.file) {
      affiliationDocUrl = getPublicMediaUrl(req.file, req);
    }

    const payload = {
      ...req.body,
      affiliation_proof_doc: affiliationDocUrl
    };

    const created = await templeService.createTemple(payload, req.user?.id || 1);

    return res.status(201).json({
      success: true,
      message: `Temple created successfully with '${created.verification_status}' verification tier.`,
      data: created
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        requiredField: err.requiredField
      });
    }
    next(err);
  }
}

export async function updateVerificationStatus(req, res, next) {
  try {
    const { id } = req.params;
    let affiliationDocUrl = req.body.affiliation_proof_doc;
    if (req.file) {
      affiliationDocUrl = getPublicMediaUrl(req.file, req);
    }

    const result = await templeService.updateVerification(
      id,
      {
        verification_status: req.body.verification_status,
        affiliation_proof_doc: affiliationDocUrl,
        notes: req.body.notes
      },
      req.user.id
    );

    return res.json({
      success: true,
      message: `Temple verification updated to '${result.verification_status}' with audit trail recorded.`,
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
        requiredField: err.requiredField
      });
    }
    next(err);
  }
}
