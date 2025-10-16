#!/usr/bin/env node

/**
 * Quick Fix Script - Manually Create Product-Partner Mapping
 * 
 * This script creates the mapping between TEST01 product and TESTP001 partner
 * that should have been created automatically but wasn't due to the bug.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Database file is in data/ directory
const dbPath = path.join(__dirname, 'data/marketplace.db');

console.log('\n🔧 Fixing Product-Partner Mapping\n');
console.log('Database:', dbPath);
console.log('='.repeat(60));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Connected to database\n');
  
  // Get TEST01 product ID
  db.get('SELECT id, name, code FROM products WHERE code = ?', ['TEST01'], (err, product) => {
    if (err) {
      console.error('❌ Error finding product:', err.message);
      db.close();
      return;
    }
    
    if (!product) {
      console.log('❌ TEST01 product not found');
      console.log('   Available products:');
      db.all('SELECT code, name FROM products LIMIT 5', (err, products) => {
        if (!err && products) {
          products.forEach(p => console.log(`   - ${p.code}: ${p.name}`));
        }
        db.close();
      });
      return;
    }
    
    console.log(`✅ Found product: ${product.name} (${product.code})`);
    console.log(`   ID: ${product.id}`);
    
    // Get TESTP001 partner ID
    db.get('SELECT id, name, code FROM partners WHERE code = ?', ['TESTP001'], (err, partner) => {
      if (err) {
        console.error('❌ Error finding partner:', err.message);
        db.close();
        return;
      }
      
      if (!partner) {
        console.log('\n❌ TESTP001 partner not found');
        console.log('   Available partners:');
        db.all('SELECT code, name, status FROM partners LIMIT 5', (err, partners) => {
          if (!err && partners) {
            partners.forEach(p => console.log(`   - ${p.code}: ${p.name} (${p.status})`));
          }
          db.close();
        });
        return;
      }
      
      console.log(`✅ Found partner: ${partner.name} (${partner.code})`);
      console.log(`   ID: ${partner.id}`);
      
      // Check if mapping already exists
      db.get('SELECT * FROM product_partners WHERE product_id = ? AND partner_id = ?', 
        [product.id, partner.id], (err, existing) => {
        
        if (err) {
          console.error('\n❌ Error checking existing mapping:', err.message);
          db.close();
          return;
        }
        
        if (existing) {
          console.log('\n⚠️  Mapping already exists!');
          console.log('   Product and partner are already linked.');
          db.close();
          return;
        }
        
        console.log('\n📝 Creating mapping...');
        
        // Create the mapping
        const mappingId = uuidv4();
        const now = new Date().toISOString();
        
        db.run('INSERT INTO product_partners (id, product_id, partner_id, created_at) VALUES (?, ?, ?, ?)',
          [mappingId, product.id, partner.id, now], function(err) {
          
          if (err) {
            console.error('\n❌ Error creating mapping:', err.message);
            db.close();
            return;
          }
          
          console.log('\n' + '='.repeat(60));
          console.log('✅ SUCCESS! Product-Partner mapping created!');
          console.log(`   ${partner.name} <-> ${product.name}`);
          console.log('='.repeat(60));
          console.log('\n💡 Now refresh your browser!');
          console.log('   TEST01 should now show TESTP001 in the dropdown!\n');
          
          db.close();
        });
      });
    });
  });
});


