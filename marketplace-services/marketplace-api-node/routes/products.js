const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

/**
 * Products API Routes
 * Handles product management including CRUD operations and approval workflow
 */

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, productType, partnerId } = req.query;
    const db = req.db;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (productType) {
      params.push(productType);
      query += ` AND product_type = $${params.length}`;
    }
    
    if (partnerId) {
      params.push(partnerId);
      query += ` AND partner_id = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error.message 
    });
  }
});

// Create new product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      code,
      name,
      productType,
      description,
      partnerId,
      partnerName,
      minInvestment,
      maxInvestment,
      currency,
      termsAndConditions,
      status = 'PENDING_APPROVAL'
    } = req.body;
    
    const db = req.db;
    
    // Validate required fields
    if (!code || !name || !productType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'name', 'productType']
      });
    }
    
    const result = await db.query(
      `INSERT INTO products (
        code, name, product_type, description, partner_id, partner_name,
        min_investment, max_investment, currency, terms_and_conditions,
        status, created_at, submitted_by, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, NOW())
      RETURNING *`,
      [
        code, name, productType, description, partnerId, partnerName,
        minInvestment || 0, maxInvestment || 0, currency || 'PHP',
        termsAndConditions, status, req.user?.email || 'admin@company.com'
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        error: 'Product code already exists',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create product',
      message: error.message 
    });
  }
});

// Update product
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
      'name', 'description', 'status', 'min_investment', 'max_investment',
      'currency', 'terms_and_conditions', 'maintenance_mode', 'whitelist_mode'
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
      UPDATE products 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      message: error.message 
    });
  }
});

// Approve product
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const db = req.db;
    
    const result = await db.query(
      `UPDATE products 
       SET status = 'ACTIVE', 
           approved_by = $1, 
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approvedBy || req.user?.email || 'admin@company.com', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ 
      error: 'Failed to approve product',
      message: error.message 
    });
  }
});

// Reject product
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, rejectedBy } = req.body;
    const db = req.db;
    
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const result = await db.query(
      `UPDATE products 
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
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ 
      error: 'Failed to reject product',
      message: error.message 
    });
  }
});

// Toggle maintenance mode
router.patch('/:id/maintenance', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      `UPDATE products 
       SET maintenance_mode = NOT maintenance_mode,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({ 
      error: 'Failed to toggle maintenance mode',
      message: error.message 
    });
  }
});

// Toggle whitelist mode
router.patch('/:id/whitelist', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      `UPDATE products 
       SET whitelist_mode = NOT whitelist_mode,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling whitelist mode:', error);
    res.status(500).json({ 
      error: 'Failed to toggle whitelist mode',
      message: error.message 
    });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.db;
    
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      message: error.message 
    });
  }
});

module.exports = router;

