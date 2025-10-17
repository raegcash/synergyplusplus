const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

/**
 * Assets API Routes
 * Handles asset management including CRUD operations and approval workflow
 */

// Get all assets with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, assetType, productId, partnerId } = req.query;
    const db = req.db;
    
    let query = 'SELECT * FROM assets WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (assetType) {
      params.push(assetType);
      query += ` AND asset_type = $${params.length}`;
    }
    
    if (productId) {
      params.push(productId);
      query += ` AND product_id = $${params.length}`;
    }
    
    if (partnerId) {
      params.push(partnerId);
      query += ` AND partner_id = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch assets',
      message: error.message 
    });
  }
});

// Get single asset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      'SELECT * FROM assets WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ 
      error: 'Failed to fetch asset',
      message: error.message 
    });
  }
});

// Create new asset
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      code,
      name,
      assetType,
      description,
      productId,
      productName,
      partnerId,
      partnerName,
      currentValue,
      currency,
      riskLevel,
      minInvestment,
      maxInvestment,
      status = 'PENDING_APPROVAL'
    } = req.body;
    
    const db = req.db;
    
    // Validate required fields
    if (!code || !name || !assetType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'name', 'assetType']
      });
    }
    
    const result = await db.query(
      `INSERT INTO assets (
        code, name, asset_type, description, product_id, product_name,
        partner_id, partner_name, current_value, currency, risk_level,
        min_investment, max_investment, status, created_at, submitted_by, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, NOW())
      RETURNING *`,
      [
        code, name, assetType, description, productId, productName,
        partnerId, partnerName, currentValue || 0, currency || 'PHP',
        riskLevel || 'MEDIUM', minInvestment || 0, maxInvestment || 0,
        status, req.user?.email || 'admin@company.com'
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        error: 'Asset code already exists',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create asset',
      message: error.message 
    });
  }
});

// Update asset
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = req.db;
    
    // Build dynamic UPDATE query
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    const allowedFields = [
      'name', 'description', 'status', 'current_value', 'risk_level',
      'min_investment', 'max_investment', 'currency'
    ];
    
    Object.keys(updates).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE assets 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ 
      error: 'Failed to update asset',
      message: error.message 
    });
  }
});

// Approve asset
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const db = req.db;
    
    const result = await db.query(
      `UPDATE assets 
       SET status = 'ACTIVE', 
           approved_by = $1, 
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approvedBy || req.user?.email || 'admin@company.com', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving asset:', error);
    res.status(500).json({ 
      error: 'Failed to approve asset',
      message: error.message 
    });
  }
});

// Reject asset
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, rejectedBy } = req.body;
    const db = req.db;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const result = await db.query(
      `UPDATE assets 
       SET status = 'REJECTED', 
           rejected_by = $1, 
           rejected_at = NOW(),
           rejection_reason = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [rejectedBy || req.user?.email || 'admin@company.com', reason, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting asset:', error);
    res.status(500).json({ 
      error: 'Failed to reject asset',
      message: error.message 
    });
  }
});

// Delete asset
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      'DELETE FROM assets WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ 
      error: 'Failed to delete asset',
      message: error.message 
    });
  }
});

module.exports = router;

