/**
 * Reset admin password to Admin@123
 */
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // Hash the password
    const password = 'Admin@123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log(`Generated hash for password: ${password}`);
    
    // Update the admin user
    const result = await query(
      `UPDATE admin_users SET password_hash = $1 WHERE email = $2`,
      [passwordHash, 'admin@superapp.com']
    );
    
    console.log(`✅ Admin password reset successfully!`);
    console.log(`   Email: admin@superapp.com`);
    console.log(`   Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();


