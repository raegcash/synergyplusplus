/**
 * Clean and Reseed Script
 * Clears all data and reseeds the database
 */

const db = require('../config/db-compat');

async function cleanAndReseed() {
  try {
    console.log('🧹 Cleaning database...\n');

    // Delete in reverse order of dependencies
    await db.run('DELETE FROM assets');
    console.log('✅ Cleared assets');

    await db.run('DELETE FROM products');
    console.log('✅ Cleared products');

    await db.run('DELETE FROM partners');
    console.log('✅ Cleared partners');

    console.log('\n✅ Database cleaned successfully!\n');
    console.log('Now run: npm run seed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanAndReseed();

