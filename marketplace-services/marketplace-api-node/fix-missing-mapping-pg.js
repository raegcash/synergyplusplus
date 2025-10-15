#!/usr/bin/env node

/**
 * Quick Fix Script - Manually Create Product-Partner Mapping (PostgreSQL)
 * 
 * This script creates the mapping between TEST01 product and TESTP001 partner
 * that should have been created automatically but wasn't due to the bug.
 */

const { query, closePool } = require('./config/database');
const { v4: uuidv4 } = require('uuid');

console.log('\n🔧 Fixing Product-Partner Mapping (PostgreSQL)\n');
console.log('='.repeat(60));

async function fixMapping() {
  try {
    console.log('✅ Connected to database\n');
    
    // Get TEST01 product
    const productResult = await query(
      'SELECT id, name, code FROM products WHERE code = $1',
      ['TEST01']
    );
    
    if (productResult.rows.length === 0) {
      console.log('❌ TEST01 product not found');
      const allProducts = await query('SELECT code, name FROM products LIMIT 5');
      console.log('   Available products:');
      allProducts.rows.forEach(p => console.log(`   - ${p.code}: ${p.name}`));
      await closePool();
      return;
    }
    
    const product = productResult.rows[0];
    console.log(`✅ Found product: ${product.name} (${product.code})`);
    console.log(`   ID: ${product.id}`);
    
    // Get TESTP001 partner
    const partnerResult = await query(
      'SELECT id, name, code, status FROM partners WHERE code = $1',
      ['TESTP001']
    );
    
    if (partnerResult.rows.length === 0) {
      console.log('\n❌ TESTP001 partner not found');
      const allPartners = await query('SELECT code, name, status FROM partners LIMIT 5');
      console.log('   Available partners:');
      allPartners.rows.forEach(p => console.log(`   - ${p.code}: ${p.name} (${p.status})`));
      await closePool();
      return;
    }
    
    const partner = partnerResult.rows[0];
    console.log(`✅ Found partner: ${partner.name} (${partner.code})`);
    console.log(`   ID: ${partner.id}`);
    console.log(`   Status: ${partner.status}`);
    
    // Check if mapping already exists
    const existingResult = await query(
      'SELECT * FROM product_partners WHERE product_id = $1 AND partner_id = $2',
      [product.id, partner.id]
    );
    
    if (existingResult.rows.length > 0) {
      console.log('\n⚠️  Mapping already exists!');
      console.log('   Product and partner are already linked.');
      await closePool();
      return;
    }
    
    console.log('\n📝 Creating mapping...');
    
    // Create the mapping
    const mappingId = uuidv4();
    const now = new Date();
    
    await query(
      'INSERT INTO product_partners (id, product_id, partner_id, created_at) VALUES ($1, $2, $3, $4)',
      [mappingId, product.id, partner.id, now]
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Product-Partner mapping created!');
    console.log(`   ${partner.name} <-> ${product.name}`);
    console.log('='.repeat(60));
    console.log('\n💡 Now refresh your browser!');
    console.log('   TEST01 should now show TESTP001 in the dropdown!\n');
    
    await closePool();
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    await closePool();
    process.exit(1);
  }
}

fixMapping();

