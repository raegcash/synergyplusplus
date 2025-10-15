/**
 * Initialize PostgreSQL Schema
 * Runs the migration SQL file to create tables and seed data
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'superapp_marketplace_node',
  user: process.env.DB_USER || 'marketplace_user',
  password: process.env.DB_PASSWORD || 'marketplace_pass123',
});

async function initSchema() {
  console.log('🚀 Initializing PostgreSQL schema...\n');
  console.log('==========================================');
  console.log(`📊 Database: ${process.env.DB_NAME || 'superapp_marketplace_node'}`);
  console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
  console.log('==========================================\n');

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Execute migration
    console.log('⚡ Executing migration...');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying database schema...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`\n📊 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verify views
    const viewsResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (viewsResult.rows.length > 0) {
      console.log(`\n📈 Created ${viewsResult.rows.length} views:`);
      viewsResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }

    // Check admin user
    const adminResult = await pool.query(`
      SELECT email, name, status 
      FROM admin_users 
      LIMIT 1
    `);

    if (adminResult.rows.length > 0) {
      console.log('\n👤 Default admin user created:');
      console.log(`   Email: ${adminResult.rows[0].email}`);
      console.log(`   Name: ${adminResult.rows[0].name}`);
      console.log(`   Status: ${adminResult.rows[0].status}`);
      console.log('   Password: Admin@123 (change after first login)');
    }

    console.log('\n==========================================');
    console.log('🎉 Schema initialization completed successfully!');
    console.log('==========================================\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Start the API server: npm start');
    console.log('   2. Access Swagger docs: http://localhost:8085/api/marketplace/docs');
    console.log('   3. Login with admin credentials');
    console.log('   4. Change default admin password\n');

  } catch (error) {
    console.error('\n❌ Error initializing schema:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initSchema().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


