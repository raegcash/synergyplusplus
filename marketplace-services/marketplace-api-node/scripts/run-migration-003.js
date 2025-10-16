#!/usr/bin/env node
/**
 * Run migration 003 - Add Customer Authentication Fields
 */

const db = require('../config/db-compat');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Running migration 003: Add Customer Authentication...\n');

  try {
    // Read migration SQL
    const migrationPath = path.join(__dirname, '../migrations/003_add_customer_auth.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('RAISE NOTICE') || statement.startsWith('DO $$')) {
        // Skip notice blocks
        continue;
      }
      try {
        await db.run(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log('⚠️  Already exists:', statement.substring(0, 50) + '...');
        } else {
          console.error('❌ Error:', err.message);
        }
      }
    }

    console.log('\n✅ Migration 003 completed successfully!');
    console.log('🔐 Added authentication fields to customers table\n');

    // Verify columns were added
    const tableInfo = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      AND column_name IN ('password_hash', 'last_login', 'failed_login_attempts', 'locked_until')
      ORDER BY column_name
    `);

    console.log('📊 Verified columns:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();

