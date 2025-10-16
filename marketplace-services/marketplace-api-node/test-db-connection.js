require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'superapp_marketplace_node',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function test() {
  try {
    console.log('Testing database connection...');
    console.log('Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Check current database
    const dbResult = await client.query('SELECT current_database(), current_schema()');
    console.log('Current database:', dbResult.rows[0]);
    
    // List all tables
    const tablesResult = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('\nTables in public schema:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.schemaname}.${row.tablename}`);
    });
    
    // Try to query investments table
    console.log('\nTrying to query investments table...');
    const investmentsResult = await client.query('SELECT COUNT(*) FROM investments');
    console.log('✅ investments table found! Count:', investmentsResult.rows[0].count);
    
    client.release();
    await pool.end();
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    await pool.end();
    process.exit(1);
  }
}

test();

