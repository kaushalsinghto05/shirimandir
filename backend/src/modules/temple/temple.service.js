import { query } from '../../database/db.js';

export class TempleService {
  /**
   * List temples with dynamic filters
   */
  async getTemples({ deity, state, verification_status, search } = {}) {
    let sql = 'SELECT * FROM temples WHERE is_active = 1';
    const params = [];
    let paramIndex = 1;

    if (deity && deity.toLowerCase() !== 'all') {
      sql += ` AND LOWER(deity) LIKE LOWER($${paramIndex++})`;
      params.push(`%${deity}%`);
    }

    if (state && state.toLowerCase() !== 'all') {
      sql += ` AND LOWER(state) = LOWER($${paramIndex++})`;
      params.push(state);
    }

    if (verification_status && verification_status.toLowerCase() !== 'all') {
      sql += ` AND verification_status = $${paramIndex++}`;
      params.push(verification_status);
    }

    if (search) {
      sql += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(location) LIKE LOWER($${paramIndex}) OR LOWER(deity) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY id ASC';

    const { rows } = await query(sql, params);
    return rows;
  }

  /**
   * Get temple by slug with associated pujas, packages, and prasad
   */
  async getTempleBySlug(slug) {
    const templeRes = await query(
      'SELECT * FROM temples WHERE slug = $1 AND is_active = 1',
      [slug]
    );

    if (templeRes.rows.length === 0) {
      return null;
    }

    const temple = templeRes.rows[0];

    // Fetch pujas available at this temple
    const pujasRes = await query(
      'SELECT * FROM pujas WHERE temple_id = $1 AND is_active = 1 ORDER BY id ASC',
      [temple.id]
    );

    // Fetch packages for each puja
    const pujasWithPackages = await Promise.all(
      pujasRes.rows.map(async (puja) => {
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

    // Fetch active Prasad items (only active items with verified FSSAI)
    const prasadRes = await query(
      'SELECT * FROM prasad_items WHERE temple_id = $1 AND is_active = 1 ORDER BY id ASC',
      [temple.id]
    );

    return {
      ...temple,
      pujas: pujasWithPackages,
      prasad_items: prasadRes.rows
    };
  }

  /**
   * Create a new temple entry
   */
  async createTemple(templeData, userId) {
    const {
      slug,
      name,
      deity,
      location,
      state,
      description,
      history,
      significance,
      timings,
      image_url,
      banner_url,
      verification_status = 'independent',
      affiliation_proof_doc,
      trust_registration_no,
      darshan_stream_url
    } = templeData;

    if (['partnered', 'official'].includes(verification_status) && !affiliation_proof_doc) {
      throw {
        status: 422,
        message: `Legal Compliance Error: Setting verification status to '${verification_status}' requires a signed affiliation proof document on file. Status must remain 'independent' until documented evidence is uploaded.`,
        requiredField: 'affiliation_proof_doc'
      };
    }

    const insertRes = await query(
      `INSERT INTO temples (
        slug, name, deity, location, state, description, history, significance, timings,
        image_url, banner_url, verification_status, affiliation_proof_doc,
        affiliation_verified_at, affiliation_verified_by, trust_registration_no, darshan_stream_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        slug,
        name,
        deity,
        location,
        state,
        description,
        history || null,
        significance || null,
        timings || null,
        image_url || 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc',
        banner_url || null,
        verification_status,
        affiliation_proof_doc || null,
        affiliation_proof_doc ? new Date().toISOString() : null,
        affiliation_proof_doc ? userId : null,
        trust_registration_no || null,
        darshan_stream_url || null
      ]
    );

    return insertRes.rows[0];
  }

  /**
   * Admin / Compliance verification update
   */
  async updateVerification(id, { verification_status, affiliation_proof_doc, notes }, adminUserId) {
    const existing = await query('SELECT * FROM temples WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw { status: 404, message: 'Temple not found' };
    }

    const currentDoc = affiliation_proof_doc || existing.rows[0].affiliation_proof_doc;

    if (['partnered', 'official'].includes(verification_status) && !currentDoc) {
      throw {
        status: 422,
        message: `Cannot promote temple to '${verification_status}' without verified affiliation document on file.`,
        requiredField: 'affiliation_proof_doc'
      };
    }

    await query(
      `UPDATE temples
       SET verification_status = $1,
           affiliation_proof_doc = $2,
           affiliation_verified_at = $3,
           affiliation_verified_by = $4,
           affiliation_notes = $5,
           updated_at = datetime('now')
       WHERE id = $6`,
      [
        verification_status,
        currentDoc,
        ['partnered', 'official'].includes(verification_status) ? new Date().toISOString() : null,
        ['partnered', 'official'].includes(verification_status) ? adminUserId : null,
        notes || null,
        id
      ]
    );

    return {
      templeId: id,
      verification_status,
      affiliation_proof_doc: currentDoc,
      verified_by: adminUserId
    };
  }

  /**
   * Get temple by ID (for inter-module lookups)
   */
  async getTempleById(id) {
    const { rows } = await query('SELECT * FROM temples WHERE id = $1', [id]);
    return rows[0] || null;
  }
}

export const templeService = new TempleService();
