import { query } from '../database/db.js';

export async function getAllPrasad(req, res) {
  try {
    const { temple_id } = req.query;

    let sql = `
      SELECT pi.*, t.name AS temple_name, t.slug AS temple_slug, t.location AS temple_location
      FROM prasad_items pi
      JOIN temples t ON pi.temple_id = t.id
      WHERE pi.is_active = 1 AND t.is_active = 1
    `;
    const params = [];

    if (temple_id) {
      sql += ' AND pi.temple_id = $1';
      params.push(temple_id);
    }

    sql += ' ORDER BY pi.id ASC';

    const { rows } = await query(sql, params);

    // COMPLIANCE: Real stock quantities, zero artificial counters
    const enriched = rows.map(item => ({
      ...item,
      in_stock: item.stock_qty > 0,
      inventory_status: item.stock_qty > 10 ? 'in_stock' : (item.stock_qty > 0 ? 'low_stock' : 'out_of_stock'),
      is_edible: Boolean(item.is_edible),
      fssai_compliant: item.is_edible ? Boolean(item.fssai_license_no && item.fssai_verified_at) : true
    }));

    return res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    console.error('Error fetching prasad items:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPrasadById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT pi.*, t.name AS temple_name, t.slug AS temple_slug, t.location AS temple_location
       FROM prasad_items pi
       JOIN temples t ON pi.temple_id = t.id
       WHERE pi.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prasad item not found' });
    }

    const item = rows[0];
    return res.json({
      success: true,
      data: {
        ...item,
        in_stock: item.stock_qty > 0,
        is_edible: Boolean(item.is_edible),
        fssai_compliant: item.is_edible ? Boolean(item.fssai_license_no && item.fssai_verified_at) : true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMPLIANCE ENDPOINT: Create Prasad Item
 * Mandatory FSSAI license for any edible item. Item stays inactive until admin approved.
 */
export async function createPrasadItem(req, res) {
  try {
    const {
      temple_id,
      name,
      description,
      price_paise,
      weight_grams,
      ingredients,
      shelf_life_days,
      image_url,
      stock_qty = 0,
      is_edible = true,
      fssai_license_no
    } = req.body;

    const isEdibleBool = Boolean(is_edible);

    // COMPLIANCE GUARD: Edible item must have FSSAI registration number
    if (isEdibleBool) {
      if (!fssai_license_no || String(fssai_license_no).trim().length < 14) {
        return res.status(422).json({
          success: false,
          error: 'Food Safety Compliance Error: All edible prasad items strictly require a valid 14-digit FSSAI license number before submission.',
          requiredField: 'fssai_license_no'
        });
      }
    }

    // Edible items ALWAYS enter as is_active = 0 until admin verifies the FSSAI license
    const initialActive = 0;

    const result = await query(
      `INSERT INTO prasad_items (
        temple_id, name, description, price_paise, weight_grams, ingredients, shelf_life_days,
        image_url, stock_qty, is_edible, fssai_license_no, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        temple_id,
        name,
        description,
        price_paise,
        weight_grams || null,
        ingredients || null,
        shelf_life_days || null,
        image_url || 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb',
        Math.max(0, parseInt(stock_qty, 10) || 0),
        isEdibleBool ? 1 : 0,
        isEdibleBool ? String(fssai_license_no).trim() : null,
        initialActive
      ]
    );

    return res.status(201).json({
      success: true,
      message: isEdibleBool
        ? 'Prasad item registered. Pending admin review of FSSAI license before activation on public store.'
        : 'Prasad offering created and queued for publishing.',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating prasad item:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMPLIANCE ENDPOINT: Admin FSSAI Verification & Activation
 */
export async function approveFSSAI(req, res) {
  try {
    const { id } = req.params;

    const itemRes = await query('SELECT * FROM prasad_items WHERE id = $1', [id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prasad item not found' });
    }

    const item = itemRes.rows[0];
    if (item.is_edible && (!item.fssai_license_no || item.fssai_license_no.length < 14)) {
      return res.status(422).json({
        success: false,
        error: 'Cannot approve edible prasad without a valid 14-digit FSSAI license number.'
      });
    }

    const now = new Date().toISOString();
    await query(
      `UPDATE prasad_items
       SET is_active = 1,
           fssai_verified_at = $1,
           fssai_verified_by = $2,
           updated_at = datetime('now')
       WHERE id = $3`,
      [now, req.user.id, id]
    );

    return res.json({
      success: true,
      message: 'FSSAI License verified and authenticated. Prasad item is now active on public store.',
      data: {
        id,
        fssai_license_no: item.fssai_license_no,
        fssai_verified_at: now,
        fssai_verified_by: req.user.id,
        is_active: true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
