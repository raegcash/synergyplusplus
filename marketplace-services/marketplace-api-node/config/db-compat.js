/**
 * SQLite to PostgreSQL Compatibility Layer
 * Provides SQLite-like API for PostgreSQL
 * This allows existing code using db.run(), db.get(), db.all() to work with PostgreSQL
 */

const { query, getClient, transaction, healthCheck, getPoolStats, closePool } = require('./database');

/**
 * Wrapper class to provide SQLite-like API
 */
class DatabaseCompat {
  constructor() {
    this.query = query;
    this.getClient = getClient;
    this.transaction = transaction;
    this.healthCheck = healthCheck;
    this.getPoolStats = getPoolStats;
    this.closePool = closePool;
  }

  /**
   * SQLite db.run() equivalent
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @param {function} callback - Callback function (err, result)
   * @returns {Promise} Promise that resolves when query completes (for await support)
   */
  run(sql, params = [], callback) {
    // Normalize params - can be called as run(sql, callback) or run(sql, params, callback)
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    // Convert SQLite parameter placeholders (?) to PostgreSQL ($1, $2, etc.)
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    const promise = query(pgSql, params)
      .then(result => {
        if (callback) {
          // Provide SQLite-like context with lastID and changes
          const context = {
            lastID: result.rows[0]?.id || null,
            changes: result.rowCount || 0
          };
          callback.call(context, null);
        }
        return result;
      })
      .catch(err => {
        if (callback) {
          callback(err);
        } else {
          console.error('Database error:', err);
        }
        throw err;
      });
    
    // Return promise for async/await support
    return promise;
  }

  /**
   * SQLite db.get() equivalent - returns single row
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @param {function} callback - Callback function (err, row)
   * @returns {Promise} Promise that resolves with the row (for await support)
   */
  get(sql, params = [], callback) {
    // Normalize params
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    // Convert placeholders
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    const promise = query(pgSql, params)
      .then(result => {
        const row = result.rows[0] || null;
        if (callback) {
          // Return first row or undefined
          callback(null, row);
        }
        return row;
      })
      .catch(err => {
        if (callback) {
          callback(err, null);
        } else {
          console.error('Database error:', err);
        }
        throw err;
      });
    
    // Return promise for async/await support
    return promise;
  }

  /**
   * SQLite db.all() equivalent - returns all rows
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @param {function} callback - Callback function (err, rows)
   * @returns {Promise} Promise that resolves with rows array (for await support)
   */
  all(sql, params = [], callback) {
    // Normalize params
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    // Convert placeholders
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    const promise = query(pgSql, params)
      .then(result => {
        const rows = result.rows || [];
        if (callback) {
          callback(null, rows);
        }
        return rows;
      })
      .catch(err => {
        if (callback) {
          callback(err, []);
        } else {
          console.error('Database error:', err);
        }
        throw err;
      });
    
    // Return promise for async/await support
    return promise;
  }

  /**
   * SQLite db.exec() equivalent
   * @param {string} sql - SQL query
   * @param {function} callback - Callback function (err)
   */
  exec(sql, callback) {
    query(sql, [])
      .then(() => {
        if (callback) callback(null);
      })
      .catch(err => {
        if (callback) {
          callback(err);
        } else {
          console.error('Database error:', err);
        }
      });
  }

  /**
   * SQLite db.prepare() equivalent
   * Returns a prepared statement object
   */
  prepare(sql) {
    // Convert placeholders once
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    return {
      run: (...args) => {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const params = args;
        
        query(pgSql, params)
          .then(result => {
            if (callback) {
              const context = {
                lastID: result.rows[0]?.id || null,
                changes: result.rowCount || 0
              };
              callback.call(context, null);
            }
          })
          .catch(err => {
            if (callback) callback(err);
          });
      },
      
      get: (...args) => {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const params = args;
        
        query(pgSql, params)
          .then(result => {
            if (callback) callback(null, result.rows[0] || null);
          })
          .catch(err => {
            if (callback) callback(err, null);
          });
      },
      
      all: (...args) => {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        const params = args;
        
        query(pgSql, params)
          .then(result => {
            if (callback) callback(null, result.rows || []);
          })
          .catch(err => {
            if (callback) callback(err, []);
          });
      },
      
      finalize: (callback) => {
        // No-op for PostgreSQL, but maintain API compatibility
        if (callback) callback(null);
      }
    };
  }

  /**
   * SQLite db.serialize() equivalent
   * In SQLite this forces sequential execution, but PostgreSQL handles this naturally
   * We execute the callback immediately
   */
  serialize(callback) {
    if (callback) {
      callback();
    }
  }

  /**
   * SQLite db.parallelize() equivalent
   * Execute callback immediately
   */
  parallelize(callback) {
    if (callback) {
      callback();
    }
  }

  /**
   * Close database connection
   */
  close(callback) {
    closePool()
      .then(() => {
        if (callback) callback(null);
      })
      .catch(err => {
        if (callback) callback(err);
      });
  }
}

// Export singleton instance
const dbCompat = new DatabaseCompat();

module.exports = dbCompat;


