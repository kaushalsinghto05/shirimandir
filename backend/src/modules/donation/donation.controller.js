import { donationService } from './donation.service.js';

export async function getCampaigns(req, res, next) {
  try {
    const templeId = req.query.temple_id ? Number(req.query.temple_id) : null;
    const campaigns = await donationService.getCampaigns(templeId);
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req, res, next) {
  try {
    const campaign = await donationService.createCampaign(req.body, req.user);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function createDonation(req, res, next) {
  try {
    const result = await donationService.createDonation(req.body, req.user || null);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyDonations(req, res, next) {
  try {
    const donations = await donationService.getDevoteeDonations(req.user.id);
    res.json({ success: true, data: donations });
  } catch (err) {
    next(err);
  }
}

export async function getReceipt(req, res, next) {
  try {
    const receipt = await donationService.getReceipt(req.params.receiptNumber);
    res.json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
}
