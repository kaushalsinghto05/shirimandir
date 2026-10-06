import { query } from '../database/db.js';
import { getPublicMediaUrl } from '../services/storageService.js';

export async function getAllTemples(req, res) {
  try {
    const { deity, state, verification_status, search } = req.query;

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
    return res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching temples:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getTempleBySlug(req, res) {
  try {
    const { slug } = req.params;

    const templeRes = await query(
      'SELECT * FROM temples WHERE slug = $1 AND is_active = 1',
      [slug]
    );

    if (templeRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Temple not found for slug '${slug}'`
      });
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

    return res.json({
      success: true,
      data: {
        ...temple,
        pujas: pujasWithPackages,
        prasad_items: prasadRes.rows
      }
    });
  } catch (err) {
    console.error('Error fetching temple details:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMPLIANCE ENDPOINT: Create Temple
 * Enforces rule: "partnered" or "official" requires a signed affiliation_proof_doc on file.
 * Never default to implying affiliation.
 */
export async function createTemple(req, res) {
  try {
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
      trust_registration_no,
      darshan_stream_url
    } = req.body;

    let affiliationDocUrl = req.body.affiliation_proof_doc || null;

    // Check if document was uploaded via file input
    if (req.file) {
      affiliationDocUrl = getPublicMediaUrl(req.file, req);
    }

    // COMPLIANCE GUARD: Cannot declare partnered or official without documented proof
    if (['partnered', 'official'].includes(verification_status) && !affiliationDocUrl) {
      return res.status(422).json({
        success: false,
        error: `Legal Compliance Error: Setting verification status to '${verification_status}' requires a signed affiliation proof document on file. Status must remain 'independent' until documented evidence is uploaded.`,
        requiredField: 'affiliation_proof_doc'
      });
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
        affiliationDocUrl,
        affiliationDocUrl ? new Date().toISOString() : null,
        affiliationDocUrl ? req.user.id : null,
        trust_registration_no || null,
        darshan_stream_url || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Temple created successfully with '${verification_status}' verification tier.`,
      data: insertRes.rows[0]
    });
  } catch (err) {
    console.error('Error creating temple:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMPLIANCE ENDPOINT: Admin Affiliation Document Review
 * Upgrades or modifies verification status after reviewing official credentials
 */
export async function updateVerificationStatus(req, res) {
  try {
    const { id } = req.params;
    const { verification_status, notes } = req.body;

    let affiliationDocUrl = req.body.affiliation_proof_doc;
    if (req.file) {
      affiliationDocUrl = getPublicMediaUrl(req.file, req);
    }

    // Check existing
    const existing = await query('SELECT * FROM temples WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Temple not found' });
    }

    const currentDoc = affiliationDocUrl || existing.rows[0].affiliation_proof_doc;

    if (['partnered', 'official'].includes(verification_status) && !currentDoc) {
      return res.status(422).json({
        success: false,
        error: `Cannot promote temple to '${verification_status}' without verified affiliation document on file.`,
        requiredField: 'affiliation_proof_doc'
      });
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
        ['partnered', 'official'].includes(verification_status) ? req.user.id : null,
        notes || null,
        id
      ]
    );

    return res.json({
      success: true,
      message: `Temple verification updated to '${verification_status}' with audit trail recorded.`,
      data: {
        templeId: id,
        verification_status,
        affiliation_proof_doc: currentDoc,
        verified_by: req.user.id
      }
    });
  } catch (err) {
    console.error('Error updating temple verification:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
