/**
 * Reset admin password to Admin@123
 * This script connects to PostgreSQL and resets the admin user password
 */
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function resetAdminPassword() {
  // Database configuration
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'superapp_marketplace_node',
    user: process.env.DB_USER || 'marketplace_user',
    password: process.env.DB_PASSWORD || 'marketplace_pass',
  });

  try {
    console.log('🔄 Resetting admin password...');
    console.log(`📊 Connecting to database: ${pool.options.database} at ${pool.options.host}:${pool.options.port}`);
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    
    // Hash the password
    const password = 'Admin@123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log(`🔐 Generated hash for password: ${password}`);
    
    // Check if admin user exists
    const checkResult = await pool.query(
      'SELECT id, email, name FROM admin_users WHERE email = $1',
      ['admin@superapp.com']
    );
    
    if (checkResult.rows.length === 0) {
      console.log('⚠️  Admin user does not exist. Creating...');
      
      // Create admin user
      await pool.query(
        `INSERT INTO admin_users (id, email, name, password_hash, status) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        ['admin@superapp.com', 'System Administrator', passwordHash, 'ACTIVE']
      );
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log(`👤 Found admin user: ${checkResult.rows[0].name} (${checkResult.rows[0].email})`);
      
      // Update the admin user password
      const updateResult = await pool.query(
        'UPDATE admin_users SET password_hash = $1 WHERE email = $2',
        [passwordHash, 'admin@superapp.com']
      );
      
      console.log(`✅ Password updated (${updateResult.rowCount} row affected)`);
    }
    
    console.log('\n🎉 Admin password reset successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`   Email:    admin@superapp.com`);
    console.log(`   Password: ${password}`);
    console.log('═══════════════════════════════════════');
    console.log('🌐 Login at: http://localhost:3003/\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('💡 Stack:', error.stack);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running:');
    console.log('   docker ps | grep postgres');
    console.log('2. Check database connection:');
    console.log('   docker exec -it superapp-postgres psql -U marketplace_user -d superapp_marketplace_node');
    console.log('3. Verify environment variables:');
    console.log(`   DB_HOST=${process.env.DB_HOST || 'localhost'}`);
    console.log(`   DB_PORT=${process.env.DB_PORT || '5432'}`);
    console.log(`   DB_NAME=${process.env.DB_NAME || 'superapp_marketplace_node'}`);
    console.log(`   DB_USER=${process.env.DB_USER || 'marketplace_user'}\n`);
    
    await pool.end();
    process.exit(1);
  }
}

resetAdminPassword();
