/**
 * Temporary API Endpoint - Manually Create Product-Partner Mapping
 * 
 * Add this to server.js temporarily to fix existing data
 */

// Add this endpoint to server.js:

app.post('/api/marketplace/admin/fix-mapping', async (req, res) => {
  const { productCode, partnerCode } = req.body;
  
  console.log(`🔧 Manual mapping fix requested: ${productCode} <-> ${partnerCode}`);
  
  try {
    // Get product
    db.get('SELECT id FROM products WHERE code = ?', [productCode], (err, product) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      // Get partner  
      db.get('SELECT id FROM partners WHERE code = ?', [partnerCode], (err, partner) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!partner) return res.status(404).json({ error: 'Partner not found' });
        
        // Check if mapping exists
        db.get('SELECT * FROM product_partners WHERE product_id = ? AND partner_id = ?',
          [product.id, partner.id], (err, existing) => {
          
          if (existing) {
            return res.json({ message: 'Mapping already exists', existing });
          }
          
          // Create mapping
          const { v4: uuidv4 } = require('uuid');
          const mappingId = uuidv4();
          
          db.run('INSERT INTO product_partners (id, product_id, partner_id) VALUES (?, ?, ?)',
            [mappingId, product.id, partner.id], function(err) {
            
            if (err) {
              console.error('❌ Failed to create mapping:', err);
              return res.status(500).json({ error: err.message });
            }
            
            console.log(`✅ Mapping created: ${productCode} <-> ${partnerCode}`);
            res.json({
              success: true,
              message: `Mapping created between ${productCode} and ${partnerCode}`,
              mappingId
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Then call it with:
// curl -X POST http://localhost:8085/api/marketplace/admin/fix-mapping \
//   -H "Content-Type: application/json" \
//   -d '{"productCode": "TEST01", "partnerCode": "TESTP001"}'

