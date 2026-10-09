import { query } from '../../database/db.js';

export class PujaService {
  /**
   * Get all pujas with packages and temple details
   */
  async getPujas({ temple_id, deity, category } = {}) {
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
    return await Promise.all(
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
  }

  /**
   * Get puja details by ID
   */
  async getPujaById(id) {
    const { rows } = await query(
      `SELECT p.*, t.name AS temple_name, t.slug AS temple_slug, t.location AS temple_location, t.verification_status
       FROM pujas p
       JOIN temples t ON p.temple_id = t.id
       WHERE p.id = $1 AND p.is_active = 1`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const puja = rows[0];
    const pkgRes = await query(
      'SELECT * FROM puja_packages WHERE puja_id = $1 ORDER BY price_paise ASC',
      [puja.id]
    );

    return {
      ...puja,
      packages: pkgRes.rows
    };
  }

  /**
   * Get package by ID (for booking module)
   */
  async getPackageById(packageId) {
    const { rows } = await query('SELECT * FROM puja_packages WHERE id = $1', [packageId]);
    return rows[0] || null;
  }
}

export const pujaService = new PujaService();
