import { prasadService } from './prasad.service.js';

export async function getAllPrasad(req, res, next) {
  try {
    const { temple_id } = req.query;
    const items = await prasadService.getPrasadItems(temple_id);
    return res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
}

export async function getPrasadById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await prasadService.getPrasadById(id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Prasad item not found' });
    }

    return res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
}

export async function createPrasadItem(req, res, next) {
  try {
    const { item, isEdible } = await prasadService.createPrasadItem(req.body);

    return res.status(201).json({
      success: true,
      message: isEdible
        ? 'Prasad item registered. Pending admin review of FSSAI license before activation on public store.'
        : 'Prasad offering created and queued for publishing.',
      data: item
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

export async function approveFSSAI(req, res, next) {
  try {
    const { id } = req.params;
    const result = await prasadService.approveFSSAI(id, req.user.id);

    return res.json({
      success: true,
      message: 'FSSAI License verified and authenticated. Prasad item is now active on public store.',
      data: result
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
}
