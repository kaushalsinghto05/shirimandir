import { pujaService } from './puja.service.js';

export async function getAllPujas(req, res, next) {
  try {
    const pujasWithPackages = await pujaService.getPujas(req.query);
    return res.json({
      success: true,
      count: pujasWithPackages.length,
      data: pujasWithPackages
    });
  } catch (err) {
    next(err);
  }
}

export async function getPujaById(req, res, next) {
  try {
    const { id } = req.params;
    const puja = await pujaService.getPujaById(id);

    if (!puja) {
      return res.status(404).json({ success: false, error: 'Puja not found' });
    }

    return res.json({
      success: true,
      data: puja
    });
  } catch (err) {
    next(err);
  }
}
