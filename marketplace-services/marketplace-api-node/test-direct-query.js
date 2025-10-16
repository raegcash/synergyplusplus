require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'superapp_marketplace_node',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testQuery() {
  const client = await pool.connect();
  
  try {
    console.log('Testing direct SELECT from investments...');
    
    // Test 1: Simple count
    const result1 = await client.query('SELECT COUNT(*) FROM public.investments');
    console.log('✅ Test 1 passed - Count:', result1.rows[0].count);
    
    // Test 2: Select with columns
    const result2 = await client.query('SELECT id, customer_id, investment_amount FROM public.investments LIMIT 1');
    console.log('✅ Test 2 passed - Rows:', result2.rows.length);
    
    // Test 3: The exact failing query
    const result3 = await client.query(`
      SELECT COALESCE(SUM(investment_amount), 0) as total
      FROM public.investments
      WHERE customer_id = $1
        AND DATE(investment_date) = CURRENT_DATE
        AND status NOT IN ('FAILED', 'CANCELLED', 'REFUNDED')
        AND deleted_at IS NULL
    `, ['1e098d2a-eaf3-4371-9478-f07797c8d58f']);
    console.log('✅ Test 3 passed - Total:', result3.rows[0].total);
    
    console.log('\n✅ ALL TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    console.error('Position:', error.position);
  } finally {
    client.release();
    await pool.end();
  }
}

testQuery();

