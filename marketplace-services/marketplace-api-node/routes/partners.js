const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

/**
 * Partners API Routes
 * Handles partner management including CRUD operations and approval workflow
 */

// Get all partners with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const db = req.db;
    
    let query = 'SELECT * FROM partners WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ 
      error: 'Failed to fetch partners',
      message: error.message 
    });
  }
});

// Get single partner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      'SELECT * FROM partners WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ 
      error: 'Failed to fetch partner',
      message: error.message 
    });
  }
});

// Create new partner
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      contactEmail,
      contactPhone,
      webhookUrl,
      status = 'PENDING'
    } = req.body;
    
    const db = req.db;
    
    // Validate required fields
    if (!code || !name || !type || !contactEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'name', 'type', 'contactEmail']
      });
    }
    
    const result = await db.query(
      `INSERT INTO partners (
        code, name, type, contact_email, contact_phone, webhook_url,
        status, created_at, submitted_by, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW())
      RETURNING *`,
      [
        code, name, type, contactEmail, contactPhone, webhookUrl,
        status, req.user?.email || 'admin@company.com'
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating partner:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        error: 'Partner code already exists',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create partner',
      message: error.message 
    });
  }
});

// Update partner
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
      'name', 'type', 'status', 'contact_email', 'contact_phone', 'webhook_url'
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
      UPDATE partners 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ 
      error: 'Failed to update partner',
      message: error.message 
    });
  }
});

// Approve partner
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const db = req.db;
    
    const result = await db.query(
      `UPDATE partners 
       SET status = 'ACTIVE', 
           approved_by = $1, 
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approvedBy || req.user?.email || 'admin@company.com', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving partner:', error);
    res.status(500).json({ 
      error: 'Failed to approve partner',
      message: error.message 
    });
  }
});

// Reject partner
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, rejectedBy } = req.body;
    const db = req.db;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const result = await db.query(
      `UPDATE partners 
       SET status = 'SUSPENDED', 
           rejected_by = $1, 
           rejected_at = NOW(),
           rejection_reason = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [rejectedBy || req.user?.email || 'admin@company.com', reason, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting partner:', error);
    res.status(500).json({ 
      error: 'Failed to reject partner',
      message: error.message 
    });
  }
});

// Delete partner
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id} = req.params;
    const db = req.db;
    
    const result = await db.query(
      'DELETE FROM partners WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ 
      error: 'Failed to delete partner',
      message: error.message 
    });
  }
});

module.exports = router;

