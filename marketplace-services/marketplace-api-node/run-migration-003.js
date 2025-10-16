const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'superapp_marketplace_node',
  user: process.env.DB_USER || 'marketplace_user',
  password: process.env.DB_PASSWORD || 'marketplace_pass',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running migration 003: Add customer authentication...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '003_add_customer_auth.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration 003 completed successfully!');
    console.log('🔐 Added authentication fields to customers table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

