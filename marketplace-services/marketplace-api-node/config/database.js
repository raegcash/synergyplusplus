/**
 * PostgreSQL Database Configuration
 * Implements connection pooling for production-grade database access
 */

const { Pool } = require('pg');

// Database configuration from environment variables
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'superapp_marketplace_node',
  user: process.env.DB_USER || 'marketplace_user',
  password: process.env.DB_PASSWORD,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 5, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // Max wait time for a connection
  
  // Additional options
  statement_timeout: 30000, // 30 second timeout for queries
  query_timeout: 30000,
  
  // SSL configuration for production
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false // Set to true in production with proper certs
    }
  })
};

// Create connection pool
const pool = new Pool(config);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Log successful connection
pool.on('connect', (client) => {
  console.log('✅ New client connected to database');
});

// Log client removal
pool.on('remove', (client) => {
  console.log('🔌 Client removed from pool');
});

/**
 * Execute a query
 * @param {string} text - SQL query text
 * @param {array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected (${duration}ms):`, text.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<PoolClient>} Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  
  // Add transaction helpers
  client.safeQuery = async (text, params) => {
    try {
      return await client.query(text, params);
    } catch (error) {
      console.error('❌ Transaction query error:', error.message);
      throw error;
    }
  };
  
  return client;
};

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise<*>} Transaction result
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Health check query
 * @returns {Promise<boolean>} Database health status
 */
const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
};

/**
 * Get pool stats
 * @returns {Object} Pool statistics
 */
const getPoolStats = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
};

/**
 * Close all database connections
 * @returns {Promise<void>}
 */
const closePool = async () => {
  console.log('🔌 Closing database connection pool...');
  await pool.end();
  console.log('✅ Database pool closed');
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM signal received');
  await closePool();
});

process.on('SIGINT', async () => {
  console.log('📡 SIGINT signal received');
  await closePool();
});

module.exports = {
  query,
  getClient,
  transaction,
  healthCheck,
  getPoolStats,
  closePool,
  pool
};



