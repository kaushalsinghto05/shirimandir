import { query } from '../database/db.js';

export async function getAllPujas(req, res) {
  try {
    const { temple_id, deity, category } = req.query;

    let sql = `
      SELECT p.*, t.name AS temple_name, t.slug AS temple_slug, t.location AS temple_location, t.verification_status
      FROM pujas p
      JOIN temples t ON p.temple_id = t.id
      WHERE p.is_active = 1 AND t.is_active = 1
    `;
    const params = [];
    let paramIndex = 1;

    if (temple_id) {
      sql += ` AND p.temple_id = $${paramIndex++}`;
      params.push(temple_id);
    }

    if (deity && deity.toLowerCase() !== 'all') {
      sql += ` AND LOWER(p.deity) LIKE LOWER($${paramIndex++})`;
      params.push(`%${deity}%`);
    }

    if (category && category.toLowerCase() !== 'all') {
      sql += ` AND p.category = $${paramIndex++}`;
      params.push(category);
    }

    sql += ' ORDER BY p.id ASC';

    const { rows } = await query(sql, params);

    // Attach packages to each puja
    const pujasWithPackages = await Promise.all(
      rows.map(async (puja) => {
        const pkgRes = await query(
          'SELECT * FROM puja_packages WHERE puja_id = $1 ORDER BY price_paise ASC',
          [puja.id]
        );
        return {
          ...puja,
          packages: pkgRes.rows
        };
      })
    );

    return res.json({
      success: true,
      count: pujasWithPackages.length,
      data: pujasWithPackages
    });
  } catch (err) {
    console.error('Error fetching pujas:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPujaById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT p.*, t.name AS temple_name, t.slug AS temple_slug, t.location AS temple_location, t.verification_status
       FROM pujas p
       JOIN temples t ON p.temple_id = t.id
       WHERE p.id = $1 AND p.is_active = 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Puja not found' });
    }

    const puja = rows[0];
    const pkgRes = await query(
      'SELECT * FROM puja_packages WHERE puja_id = $1 ORDER BY price_paise ASC',
      [puja.id]
    );

    return res.json({
      success: true,
      data: {
        ...puja,
        packages: pkgRes.rows
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
