const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/db-compat');

const app = express();
const PORT = 8085;
const JWT_SECRET = process.env.JWT_SECRET || 'superapp-secret-key-change-in-production';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marketplace API',
      version: '1.0.0',
      description: 'Comprehensive REST API for Super App Marketplace - Products, Partners, Assets, Approvals, Features, and more',
      contact: {
        name: 'Super App Team',
        email: 'api@superapp.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:8085/api/marketplace',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization endpoints' },
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Partners', description: 'Partner management endpoints' },
      { name: 'Assets', description: 'Asset management endpoints' },
      { name: 'Approvals', description: 'Approval workflow endpoints' },
      { name: 'Change Requests', description: 'Configuration change requests' },
      { name: 'Features', description: 'Feature flag management' },
      { name: 'Greylist', description: 'Whitelist/Blacklist management' },
      { name: 'Eligibility', description: 'Eligibility rules and criteria management' },
      { name: 'Data Points', description: 'Data points configuration and management' },
      { name: 'Admin Users', description: 'Admin portal user management' },
      { name: 'User Groups', description: 'User group and role management' },
      { name: 'Permissions', description: 'Permission management endpoints' },
      { name: 'Customers', description: 'End-user customer management' },
      { name: 'Reports', description: 'Report generation and management' },
      { name: 'Scheduled Tasks', description: 'Scheduled task configuration' },
      { name: 'Integrations', description: 'Partner integration endpoints' },
      { name: 'Asset Data', description: 'Asset data points and NAV management' },
      { name: 'Health', description: 'Health check and status endpoints' },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(bodyParser.json());

// Swagger UI
app.use('/api/marketplace/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Marketplace API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Swagger JSON
app.get('/api/marketplace/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Database setup - PostgreSQL
require('dotenv').config();

// Test database connection on startup
(async () => {
  try {
    const isHealthy = await db.healthCheck();
    if (isHealthy) {
      console.log('✅ Connected to PostgreSQL database');
      const stats = db.getPoolStats();
      console.log(`📊 Connection pool: ${stats.totalCount} total, ${stats.idleCount} idle`);
    } else {
      console.error('❌ Database health check failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
})();

// Database schema is managed via migrations
// Run: npm run init-schema to initialize the database
// Schema initialization removed - using PostgreSQL migrations
/*
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PENDING_APPROVAL',
    min_investment REAL NOT NULL,
    max_investment REAL NOT NULL,
    currency TEXT DEFAULT 'PHP',
    maintenance_mode INTEGER DEFAULT 0,
    whitelist_mode INTEGER DEFAULT 0,
    features_count INTEGER DEFAULT 0,
    enabled_features_count INTEGER DEFAULT 0,
    assets_count INTEGER DEFAULT 0,
    terms_and_conditions TEXT,
    submitted_by TEXT,
    submitted_at TEXT,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Partners table
  db.run(`CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    partner_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PENDING_APPROVAL',
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    registration_number TEXT,
    tax_id TEXT,
    address TEXT,
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    sftp_host TEXT,
    sftp_username TEXT,
    submitted_by TEXT,
    submitted_at TEXT,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Product_Partners join table
  db.run(`CREATE TABLE IF NOT EXISTS product_partners (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    commission_rate REAL,
    status TEXT DEFAULT 'ACTIVE',
    mapped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    mapped_by TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (partner_id) REFERENCES partners(id)
  )`);

  // Assets table
  db.run(`CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    asset_code TEXT UNIQUE NOT NULL,
    asset_type TEXT NOT NULL,
    description TEXT,
    current_price REAL NOT NULL,
    price_currency TEXT DEFAULT 'PHP',
    min_investment REAL NOT NULL,
    max_investment REAL NOT NULL,
    investment_amount REAL,
    indicative_units REAL,
    indicative_navpu REAL,
    nav_as_of_date TEXT,
    nav_per_unit REAL,
    risk_level TEXT,
    historical_return REAL,
    year_to_date_return REAL,
    status TEXT DEFAULT 'PENDING_APPROVAL',
    submission_source TEXT,
    submitted_by TEXT,
    submitted_at TEXT,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (partner_id) REFERENCES partners(id)
  )`);

  // Approvals table
  db.run(`CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    priority INTEGER DEFAULT 0,
    current_step TEXT,
    next_step TEXT,
    hierarchy_level INTEGER DEFAULT 1,
    approved_by TEXT,
    approved_at TEXT,
    rejected_by TEXT,
    rejected_at TEXT,
    rejection_reason TEXT,
    submitted_by TEXT NOT NULL,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Change Requests table
  db.run(`CREATE TABLE IF NOT EXISTS change_requests (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    change_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    requested_by TEXT NOT NULL,
    requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
    reviewed_by TEXT,
    reviewed_at TEXT,
    rejection_reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // Features table
  db.run(`CREATE TABLE IF NOT EXISTS features (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    parent_feature_id TEXT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    feature_type TEXT,
    enabled INTEGER DEFAULT 1,
    maintenance_mode INTEGER DEFAULT 0,
    whitelist_mode INTEGER DEFAULT 0,
    rollout_percentage INTEGER DEFAULT 100,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (parent_feature_id) REFERENCES features(id)
  )`);

  // Greylist table
  db.run(`CREATE TABLE IF NOT EXISTS greylist (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    msisdn TEXT,
    product_id TEXT NOT NULL,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    list_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    expires_at TEXT,
    added_by TEXT NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // Customers table (end-users/investors)
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_code TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    mobile_number TEXT,
    date_of_birth TEXT,
    nationality TEXT,
    kyc_status TEXT DEFAULT 'PENDING',
    kyc_verified_at TEXT,
    account_status TEXT DEFAULT 'ACTIVE',
    onboarded_products TEXT,
    total_investments REAL DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    risk_profile TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Philippines',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  )`);

  // Admin Users table (admin portal users)
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    status TEXT DEFAULT 'ACTIVE',
    last_login_at TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // User Groups table
  db.run(`CREATE TABLE IF NOT EXISTS user_groups (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Permissions table
  db.run(`CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // User Group Members junction table
  db.run(`CREATE TABLE IF NOT EXISTS user_group_members (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id),
    FOREIGN KEY (group_id) REFERENCES user_groups(id)
  )`);

  // User Group Permissions junction table
  db.run(`CREATE TABLE IF NOT EXISTS user_group_permissions (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES user_groups(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
  )`);

  // Seed default permissions
  const defaultPermissions = [
    // Products
    { module: 'products', action: 'view', name: 'View Products', code: 'products.view' },
    { module: 'products', action: 'create', name: 'Create Products', code: 'products.create' },
    { module: 'products', action: 'edit', name: 'Edit Products', code: 'products.edit' },
    { module: 'products', action: 'delete', name: 'Delete Products', code: 'products.delete' },
    { module: 'products', action: 'approve', name: 'Approve Products', code: 'products.approve' },
    // Partners
    { module: 'partners', action: 'view', name: 'View Partners', code: 'partners.view' },
    { module: 'partners', action: 'create', name: 'Create Partners', code: 'partners.create' },
    { module: 'partners', action: 'edit', name: 'Edit Partners', code: 'partners.edit' },
    { module: 'partners', action: 'delete', name: 'Delete Partners', code: 'partners.delete' },
    { module: 'partners', action: 'approve', name: 'Approve Partners', code: 'partners.approve' },
    // Assets
    { module: 'assets', action: 'view', name: 'View Assets', code: 'assets.view' },
    { module: 'assets', action: 'create', name: 'Create Assets', code: 'assets.create' },
    { module: 'assets', action: 'edit', name: 'Edit Assets', code: 'assets.edit' },
    { module: 'assets', action: 'delete', name: 'Delete Assets', code: 'assets.delete' },
    { module: 'assets', action: 'approve', name: 'Approve Assets', code: 'assets.approve' },
    // Approvals
    { module: 'approvals', action: 'view', name: 'View Approvals', code: 'approvals.view' },
    { module: 'approvals', action: 'approve', name: 'Approve Items', code: 'approvals.approve' },
    { module: 'approvals', action: 'reject', name: 'Reject Items', code: 'approvals.reject' },
    // Hypercare
    { module: 'hypercare', action: 'view', name: 'View Hypercare', code: 'hypercare.view' },
    { module: 'hypercare', action: 'manage', name: 'Manage Hypercare', code: 'hypercare.manage' },
    // Operations
    { module: 'operations', action: 'view', name: 'View Operations', code: 'operations.view' },
    { module: 'operations', action: 'manage', name: 'Manage Operations', code: 'operations.manage' },
    // Customers
    { module: 'customers', action: 'view', name: 'View Customers', code: 'customers.view' },
    { module: 'customers', action: 'manage', name: 'Manage Customers', code: 'customers.manage' },
    // Admin & IAM
    { module: 'admin', action: 'view_users', name: 'View Admin Users', code: 'admin.view_users' },
    { module: 'admin', action: 'manage_users', name: 'Manage Admin Users', code: 'admin.manage_users' },
    { module: 'admin', action: 'view_groups', name: 'View User Groups', code: 'admin.view_groups' },
    { module: 'admin', action: 'manage_groups', name: 'Manage User Groups', code: 'admin.manage_groups' },
    { module: 'admin', action: 'manage_permissions', name: 'Manage Permissions', code: 'admin.manage_permissions' }
  ];

  db.get(`SELECT COUNT(*) as count FROM permissions`, [], (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO permissions (id, name, code, module, action, description) VALUES (?, ?, ?, ?, ?, ?)`);
      defaultPermissions.forEach(perm => {
        stmt.run(uuidv4(), perm.name, perm.code, perm.module, perm.action, `Permission to ${perm.action} ${perm.module}`);
      });
      stmt.finalize();
      console.log('✅ Default permissions seeded');
    }
  });

  // Seed default admin user and super admin group
  db.get(`SELECT COUNT(*) as count FROM admin_users`, [], async (err, row) => {
    if (!err && row.count === 0) {
      const defaultPassword = 'Admin@123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const adminUserId = uuidv4();
      const superAdminGroupId = uuidv4();
      
      // Create default admin user
      db.run(
        `INSERT INTO admin_users (id, username, email, password_hash, first_name, last_name, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [adminUserId, 'admin', 'admin@superapp.com', passwordHash, 'Super', 'Admin', 'ACTIVE', 'system'],
        (err) => {
          if (err) {
            console.error('Error creating default admin user:', err);
          } else {
            console.log('✅ Default admin user created (username: admin, password: Admin@123)');
          }
        }
      );

      // Create Super Admin group
      db.run(
        `INSERT INTO user_groups (id, name, code, description, status, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [superAdminGroupId, 'Super Administrators', 'SUPER_ADMIN', 'Full system access with all permissions', 'ACTIVE', 'system'],
        (err) => {
          if (err) {
            console.error('Error creating Super Admin group:', err);
          } else {
            console.log('✅ Super Admin group created');
            
            // Assign admin user to Super Admin group
            db.run(
              `INSERT INTO user_group_members (id, user_id, group_id, assigned_by) VALUES (?, ?, ?, ?)`,
              [uuidv4(), adminUserId, superAdminGroupId, 'system']
            );
            
            // Assign all permissions to Super Admin group
            db.all(`SELECT id FROM permissions`, [], (err, permissions) => {
              if (!err && permissions) {
                const stmt = db.prepare(`INSERT INTO user_group_permissions (id, group_id, permission_id, assigned_by) VALUES (?, ?, ?, ?)`);
                permissions.forEach(perm => {
                  stmt.run(uuidv4(), superAdminGroupId, perm.id, 'system');
                });
                stmt.finalize();
                console.log('✅ All permissions assigned to Super Admin group');
              }
            });
          }
        }
      );
    }
  });

  console.log('✅ Database tables created');
});
*/
console.log('✅ Database ready - using PostgreSQL with migrations');

// ============================================
// MIDDLEWARE - Authentication
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper functions
const createApproval = (itemType, itemId, submittedBy) => {
  const approval = {
    id: uuidv4(),
    item_type: itemType,
    item_id: itemId,
    status: 'PENDING',
    submitted_by: submittedBy,
    submitted_at: new Date().toISOString(),
    current_step: `${itemType} Creation`,
    next_step: 'Admin Approval',
    hierarchy_level: 1
  };

  db.run(`INSERT INTO approvals (
    id, item_type, item_id, status, priority,
    current_step, next_step, hierarchy_level,
    approved_by, approved_at, rejected_by, rejected_at, rejection_reason,
    submitted_by, submitted_at, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [approval.id, approval.item_type, approval.item_id, approval.status, approval.priority || 0,
     approval.current_step, approval.next_step, approval.hierarchy_level,
     null, null, null, null, null,
     approval.submitted_by, approval.submitted_at, approval.submitted_at, approval.submitted_at]);

  return approval;
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login to admin portal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/marketplace/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Note: PostgreSQL schema uses 'email' column, not 'username'
  db.get(`SELECT * FROM admin_users WHERE email = ? AND status = 'ACTIVE'`, [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({ error: 'Account is temporarily locked. Please try again later.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      
      if (newFailedAttempts >= 5) {
        // Lock account for 15 minutes after 5 failed attempts
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      db.run(
        `UPDATE admin_users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`,
        [newFailedAttempts, lockedUntil, user.id]
      );

      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Reset failed login attempts and update last login
    db.run(
      `UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?`,
      [new Date().toISOString(), user.id]
    );

    // Get user groups and permissions
    db.all(`
      SELECT ug.id, ug.name
      FROM user_groups ug
      INNER JOIN user_group_members ugm ON ug.id = ugm.group_id
      WHERE ugm.user_id = ?
    `, [user.id], (err, groups) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get all permissions for user's groups
      const groupIds = groups.map(g => g.id);
      if (groupIds.length === 0) {
        return sendLoginResponse(user, [], []);
      }

      const placeholders = groupIds.map(() => '?').join(',');
      db.all(`
        SELECT DISTINCT p.id, p.name, p.code, p.module, p.action
        FROM permissions p
        INNER JOIN user_group_permissions ugp ON p.id = ugp.permission_id
        WHERE ugp.group_id IN (${placeholders})
      `, groupIds, (err, permissions) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        sendLoginResponse(user, groups, permissions);
      });
    });

    function sendLoginResponse(user, groups, permissions) {
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          groups: groups.map(g => g.name),
          permissions: permissions.map(p => p.name)
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          status: user.status,
          groups: groups,
          permissions: permissions
        }
      });
    }
  });
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify authentication token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid token
 */
app.get('/api/marketplace/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout from admin portal
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
app.post('/api/marketplace/auth/logout', authenticateToken, (req, res) => {
  // In a production system, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

// ============================================
// ADMIN USERS ROUTES
// ============================================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get all admin users
 *     description: Retrieve all admin portal users
 *     responses:
 *       200:
 *         description: List of admin users
 */
app.get('/api/marketplace/admin/users', (req, res) => {
  db.all(`SELECT id, email, name, status, last_login, created_at, updated_at FROM admin_users`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Get admin user by ID
 *     description: Retrieve a specific admin user with their groups and permissions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin user details with groups
 *       404:
 *         description: Admin user not found
 */
app.get('/api/marketplace/admin/users/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT id, email, name, status, last_login, created_at, updated_at FROM admin_users WHERE id = ?`, [id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's groups
    db.all(`
      SELECT ug.*, ugm.assigned_at, ugm.assigned_by
      FROM user_groups ug
      INNER JOIN user_group_members ugm ON ug.id = ugm.group_id
      WHERE ugm.user_id = ?
    `, [id], (err, groups) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      user.groups = groups;
      res.json(user);
    });
  });
});

/**
 * @swagger
 * /admin/users:
 *   post:
 *     tags: [Admin Users]
 *     summary: Create an admin user
 *     description: Create a new admin portal user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin user created successfully
 */
app.post('/api/marketplace/admin/users', async (req, res) => {
  const { username, email, password, first_name, last_name, phone_number, group_ids } = req.body;
  
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO admin_users (id, username, email, password_hash, first_name, last_name, phone_number, status, created_by, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)`,
    [id, username, email, passwordHash, first_name, last_name, phone_number, 'admin', now, now],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Assign user to groups
      if (group_ids && group_ids.length > 0) {
        const stmt = db.prepare(`INSERT INTO user_group_members (id, user_id, group_id, assigned_by) VALUES (?, ?, ?, ?)`);
        group_ids.forEach(groupId => {
          stmt.run(uuidv4(), id, groupId, 'admin');
        });
        stmt.finalize();
      }

      res.status(201).json({ id, username, email, first_name, last_name, phone_number, status: 'ACTIVE', created_at: now, updated_at: now });
    }
  );
});

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     tags: [Admin Users]
 *     summary: Update an admin user
 *     description: Update admin user information and group assignments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Admin user updated successfully
 *       404:
 *         description: Admin user not found
 */
app.put('/api/marketplace/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email, first_name, last_name, phone_number, status, password, group_ids } = req.body;
  
  let query = `UPDATE admin_users SET email = ?, first_name = ?, last_name = ?, phone_number = ?, status = ?, updated_at = ?`;
  let params = [email, first_name, last_name, phone_number, status, new Date().toISOString()];

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    query += `, password_hash = ?`;
    params.push(passwordHash);
  }

  query += ` WHERE id = ?`;
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Update group assignments
    if (group_ids !== undefined) {
      // Remove existing assignments
      db.run(`DELETE FROM user_group_members WHERE user_id = ?`, [id], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Add new assignments
        if (group_ids.length > 0) {
          const stmt = db.prepare(`INSERT INTO user_group_members (id, user_id, group_id, assigned_by) VALUES (?, ?, ?, ?)`);
          group_ids.forEach(groupId => {
            stmt.run(uuidv4(), id, groupId, 'admin');
          });
          stmt.finalize();
        }
      });
    }

    res.json({ id, email, first_name, last_name, phone_number, status, updated_at: params[5] });
  });
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin Users]
 *     summary: Delete an admin user
 *     description: Remove an admin portal user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Admin user deleted successfully
 *       404:
 *         description: Admin user not found
 */
app.delete('/api/marketplace/admin/users/:id', (req, res) => {
  const { id } = req.params;
  
  // Remove from groups first
  db.run(`DELETE FROM user_group_members WHERE user_id = ?`, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.run(`DELETE FROM admin_users WHERE id = ?`, [id], function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'User deleted successfully' });
    });
  });
});

// ============================================
// USER GROUPS ROUTES
// ============================================

/**
 * @swagger
 * /admin/groups:
 *   get:
 *     tags: [User Groups]
 *     summary: Get all user groups
 *     description: Retrieve all user groups with member counts
 *     responses:
 *       200:
 *         description: List of user groups
 */
app.get('/api/marketplace/admin/groups', (req, res) => {
  db.all(`SELECT * FROM user_groups ORDER BY name`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get member count for each group
    const promises = rows.map(group => {
      return new Promise((resolve) => {
        db.get(`SELECT COUNT(*) as count FROM user_group_members WHERE group_id = ?`, [group.id], (err, result) => {
          group.member_count = result ? result.count : 0;
          resolve(group);
        });
      });
    });

    Promise.all(promises).then(groups => {
      res.json(groups);
    });
  });
});

// Get user group by ID with members and permissions
app.get('/api/marketplace/admin/groups/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT * FROM user_groups WHERE id = ?`, [id], (err, group) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get group members
    db.all(`
      SELECT au.id, au.username, au.email, au.first_name, au.last_name, ugm.assigned_at
      FROM admin_users au
      INNER JOIN user_group_members ugm ON au.id = ugm.user_id
      WHERE ugm.group_id = ?
    `, [id], (err, members) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get group permissions
      db.all(`
        SELECT p.*, ugp.assigned_at
        FROM permissions p
        INNER JOIN user_group_permissions ugp ON p.id = ugp.permission_id
        WHERE ugp.group_id = ?
      `, [id], (err, permissions) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        group.members = members;
        group.permissions = permissions;
        res.json(group);
      });
    });
  });
});

// Create user group
app.post('/api/marketplace/admin/groups', (req, res) => {
  const { name, code, description, permission_ids } = req.body;
  
  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO user_groups (id, name, code, description, status, created_by, created_at, updated_at) 
     VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?)`,
    [id, name, code, description, 'admin', now, now],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Assign permissions to group
      if (permission_ids && permission_ids.length > 0) {
        const stmt = db.prepare(`INSERT INTO user_group_permissions (id, group_id, permission_id, assigned_by) VALUES (?, ?, ?, ?)`);
        permission_ids.forEach(permId => {
          stmt.run(uuidv4(), id, permId, 'admin');
        });
        stmt.finalize();
      }

      res.status(201).json({ id, name, code, description, status: 'ACTIVE', created_at: now, updated_at: now });
    }
  );
});

// Update user group
app.put('/api/marketplace/admin/groups/:id', (req, res) => {
  const { id } = req.params;
  const { name, code, description, status, permission_ids } = req.body;
  
  db.run(
    `UPDATE user_groups SET name = ?, code = ?, description = ?, status = ?, updated_at = ? WHERE id = ?`,
    [name, code, description, status, new Date().toISOString(), id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Update permission assignments
      if (permission_ids !== undefined) {
        // Remove existing assignments
        db.run(`DELETE FROM user_group_permissions WHERE group_id = ?`, [id], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Add new assignments
          if (permission_ids.length > 0) {
            const stmt = db.prepare(`INSERT INTO user_group_permissions (id, group_id, permission_id, assigned_by) VALUES (?, ?, ?, ?)`);
            permission_ids.forEach(permId => {
              stmt.run(uuidv4(), id, permId, 'admin');
            });
            stmt.finalize();
          }
        });
      }

      res.json({ id, name, code, description, status, updated_at: new Date().toISOString() });
    }
  );
});

// Delete user group
app.delete('/api/marketplace/admin/groups/:id', (req, res) => {
  const { id } = req.params;
  
  // Remove members and permissions first
  db.run(`DELETE FROM user_group_members WHERE group_id = ?`, [id]);
  db.run(`DELETE FROM user_group_permissions WHERE group_id = ?`, [id]);

  db.run(`DELETE FROM user_groups WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Group deleted successfully' });
  });
});

// Add user to group
app.post('/api/marketplace/admin/groups/:groupId/members/:userId', (req, res) => {
  const { groupId, userId } = req.params;
  const id = uuidv4();

  db.run(
    `INSERT INTO user_group_members (id, user_id, group_id, assigned_by) VALUES (?, ?, ?, ?)`,
    [id, userId, groupId, 'admin'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id, user_id: userId, group_id: groupId, assigned_at: new Date().toISOString() });
    }
  );
});

// Remove user from group
app.delete('/api/marketplace/admin/groups/:groupId/members/:userId', (req, res) => {
  const { groupId, userId } = req.params;

  db.run(
    `DELETE FROM user_group_members WHERE user_id = ? AND group_id = ?`,
    [userId, groupId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'User removed from group' });
    }
  );
});

// ============================================
// PERMISSIONS ROUTES
// ============================================

// Get all permissions
app.get('/api/marketplace/admin/permissions', (req, res) => {
  db.all(`SELECT * FROM permissions ORDER BY module, action`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get permissions by module
app.get('/api/marketplace/admin/permissions/by-module/:module', (req, res) => {
  const { module } = req.params;
  
  db.all(`SELECT * FROM permissions WHERE module = ? ORDER BY action`, [module], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ============================================
// CUSTOMERS ROUTES
// ============================================

/**
 * @swagger
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers
 *     description: Retrieve all end-user customers
 *     responses:
 *       200:
 *         description: List of customers
 */
app.get('/api/marketplace/customers', (req, res) => {
  db.all(`SELECT * FROM customers ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 *     description: Retrieve a specific customer's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
app.get('/api/marketplace/customers/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT * FROM customers WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(row);
  });
});

/**
 * @swagger
 * /customers:
 *   post:
 *     tags: [Customers]
 *     summary: Create a customer
 *     description: Register a new end-user customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *             properties:
 *               customer_code:
 *                 type: string
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
app.post('/api/marketplace/customers', (req, res) => {
  const { 
    email, first_name, last_name, phone,
    date_of_birth, kyc_status 
  } = req.body;
  
  const id = uuidv4();
  const now = new Date().toISOString();

  // PostgreSQL schema only has: email, phone, first_name, last_name, date_of_birth, kyc_status, status
  db.run(
    `INSERT INTO customers (
      id, email, first_name, last_name, phone,
      date_of_birth, kyc_status, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
    [id, email, first_name, last_name, phone,
     date_of_birth, kyc_status || 'PENDING', now, now],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      res.status(201).json({ 
        id, email, first_name, last_name, phone,
        kyc_status: kyc_status || 'PENDING', 
        status: 'ACTIVE',
        created_at: now, updated_at: now 
      });
    }
  );
});

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     tags: [Customers]
 *     summary: Update a customer
 *     description: Update customer information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 */
app.put('/api/marketplace/customers/:id', (req, res) => {
  const { id } = req.params;
  const { 
    email, first_name, last_name, phone,
    date_of_birth, kyc_status, status
  } = req.body;
  
  // PostgreSQL schema: email, phone, first_name, last_name, date_of_birth, kyc_status, status
  db.run(
    `UPDATE customers SET 
      email = ?, first_name = ?, last_name = ?, phone = ?,
      date_of_birth = ?, kyc_status = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [email, first_name, last_name, phone,
     date_of_birth, kyc_status || 'PENDING', status || 'ACTIVE',
     id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      // Return the updated customer
      db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

// Delete customer
app.delete('/api/marketplace/customers/:id', (req, res) => {
  const { id } = req.params;
  
  db.run(`DELETE FROM customers WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Customer deleted successfully' });
  });
});

// ============================================
// PRODUCT ROUTES
// ============================================

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Retrieve a list of all products in the marketplace
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
// Helper function to transform product from DB to API format
const transformProduct = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  productType: row.product_type,
  description: row.description,
  status: row.status,
  minInvestment: row.min_investment,
  maxInvestment: row.max_investment,
  currency: row.currency,
  maintenanceMode: row.maintenance_mode === 1,
  whitelistMode: row.whitelist_mode === 1,
  featuresCount: row.features_count,
  enabledFeaturesCount: row.enabled_features_count,
  assetsCount: row.assets_count,
  termsAndConditions: row.terms_and_conditions,
  submittedBy: row.submitted_by,
  submittedAt: row.submitted_at,
  approvedAt: row.approved_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

app.get('/api/marketplace/products', (req, res) => {
  // Support filtering by status query parameter
  const { status } = req.query;
  
  let query = 'SELECT * FROM products';
  const params = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(transformProduct));
  });
});

app.get('/api/marketplace/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(transformProduct(row));
  });
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     description: Create a new product and automatically generate an approval request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - product_type
 *               - min_investment
 *               - max_investment
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               product_type:
 *                 type: string
 *               description:
 *                 type: string
 *               min_investment:
 *                 type: number
 *               max_investment:
 *                 type: number
 *               currency:
 *                 type: string
 *               terms_and_conditions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       409:
 *         description: Product code already exists
 *       500:
 *         description: Server error
 */
app.post('/api/marketplace/products', (req, res) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  // Handle both camelCase and snake_case input
  const productType = req.body.productType || req.body.product_type;
  const minInvestment = req.body.minInvestment || req.body.min_investment;
  const maxInvestment = req.body.maxInvestment || req.body.max_investment;
  const maintenanceMode = req.body.maintenanceMode || req.body.maintenance_mode || false;
  const whitelistMode = req.body.whitelistMode || req.body.whitelist_mode || false;
  const termsAndConditions = req.body.termsAndConditions || req.body.terms_and_conditions;
  const submittedBy = req.body.submittedBy || req.body.submitted_by || 'admin@superapp.com';

  db.run(`INSERT INTO products (id, code, name, product_type, description, status, min_investment, max_investment, 
    currency, maintenance_mode, whitelist_mode, features_count, enabled_features_count, assets_count, 
    terms_and_conditions, submitted_by, submitted_at, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.body.code, req.body.name, productType, req.body.description, 'PENDING_APPROVAL',
     minInvestment, maxInvestment, req.body.currency || 'PHP',
     maintenanceMode ? 1 : 0, whitelistMode ? 1 : 0, 0, 0, 0,
     termsAndConditions, submittedBy, now, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      createApproval('PRODUCT', id, submittedBy);
      
      // Return transformed product
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(transformProduct(row));
      });
    }
  );
});

app.put('/api/marketplace/products/:id', (req, res) => {
  const updates = req.body;
  
  // Map camelCase to snake_case for database
  const fieldMapping = {
    'productType': 'product_type',
    'minInvestment': 'min_investment',
    'maxInvestment': 'max_investment',
    'maintenanceMode': 'maintenance_mode',
    'whitelistMode': 'whitelist_mode',
    'featuresCount': 'features_count',
    'enabledFeaturesCount': 'enabled_features_count',
    'assetsCount': 'assets_count',
    'termsAndConditions': 'terms_and_conditions',
    'submittedBy': 'submitted_by',
    'submittedAt': 'submitted_at',
    'approvedAt': 'approved_at',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  };

  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (key !== 'id' && key !== 'createdAt') {
      const dbColumn = fieldMapping[key] || key;
      fields.push(`${dbColumn} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(req.params.id);

  db.run(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: err.message, details: 'Failed to update product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Error fetching updated product:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(transformProduct(row));
    });
  });
});

app.patch('/api/marketplace/products/:id/approve', (req, res) => {
  const now = new Date().toISOString();
  // PostgreSQL check constraint allows: PENDING_APPROVAL, ACTIVE, INACTIVE, REJECTED
  db.run('UPDATE products SET status = ?, approved_at = ?, updated_at = ? WHERE id = ?',
    ['ACTIVE', now, now, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('UPDATE approvals SET status = ?, approved_by = ?, approved_at = ? WHERE item_id = ? AND item_type = ?',
      ['APPROVED', 'admin@superapp.com', now, req.params.id, 'PRODUCT']);
    
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
      res.json(row);
    });
  });
});

app.patch('/api/marketplace/products/:id/reject', (req, res) => {
  const now = new Date().toISOString();
  db.run('UPDATE products SET status = ?, updated_at = ? WHERE id = ?',
    ['REJECTED', now, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('UPDATE approvals SET status = ?, rejected_by = ?, rejected_at = ?, rejection_reason = ? WHERE item_id = ? AND item_type = ?',
      ['REJECTED', 'admin@superapp.com', now, req.body.reason || 'Not meeting requirements', req.params.id, 'PRODUCT']);
    
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
      res.json(row);
    });
  });
});

app.delete('/api/marketplace/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });
});

/**
 * @swagger
 * /products/{id}/features:
 *   get:
 *     tags: [Features]
 *     summary: Get product features
 *     description: Retrieve all feature flags for a specific product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product features
 *       404:
 *         description: Product not found
 */
app.get('/api/marketplace/products/:id/features', (req, res) => {
  const { id } = req.params;
  
  // First check if product exists
  db.get('SELECT id FROM products WHERE id = ?', [id], (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Get features for this product (if features table exists)
    db.all(`SELECT * FROM features WHERE product_id = ? ORDER BY name`, [id], (err, features) => {
      if (err) {
        // If features table doesn't exist, return empty array
        if (err.message.includes('no such table') || err.message.includes('does not exist')) {
          return res.json([]);
        }
        return res.status(500).json({ error: err.message });
      }
      res.json(features || []);
    });
  });
});

// ============================================
// PARTNER ROUTES
// ============================================

// Helper function to transform partner from DB to API format
const transformPartner = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  partnerType: row.partner_type,
  description: row.description,
  status: row.status,
  contactPerson: row.contact_person,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  website: row.website,
  registrationNumber: row.registration_number,
  taxId: row.tax_id,
  address: row.address,
  apiEndpoint: row.api_endpoint,
  apiKeyEncrypted: row.api_key_encrypted,
  sftpHost: row.sftp_host,
  sftpUsername: row.sftp_username,
  submittedBy: row.submitted_by,
  submittedAt: row.submitted_at,
  approvedAt: row.approved_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

/**
 * @swagger
 * /partners:
 *   get:
 *     tags: [Partners]
 *     summary: Get all partners
 *     responses:
 *       200:
 *         description: List of all partners
 */
app.get('/api/marketplace/partners', (req, res) => {
  // Support filtering by status query parameter
  const { status } = req.query;
  
  let query = 'SELECT * FROM partners';
  const params = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(transformPartner));
  });
});

/**
 * @swagger
 * /partners/status/{status}:
 *   get:
 *     tags: [Partners]
 *     summary: Get partners by status
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of partners with specified status
 */
app.get('/api/marketplace/partners/status/:status', (req, res) => {
  db.all('SELECT * FROM partners WHERE status = ? ORDER BY created_at DESC', [req.params.status], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(transformPartner));
  });
});

/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     tags: [Partners]
 *     summary: Get partner by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner details
 *       404:
 *         description: Partner not found
 */
app.get('/api/marketplace/partners/:id', (req, res) => {
  db.get('SELECT * FROM partners WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(transformPartner(row));
  });
});

/**
 * @swagger
 * /partners:
 *   post:
 *     tags: [Partners]
 *     summary: Create a new partner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - partnerType
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               partnerType:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       500:
 *         description: Server error
 */
app.post('/api/marketplace/partners', (req, res) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Validate required fields
    if (!req.body.code || !req.body.name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Code and name are required' 
      });
    }
    
    // Handle both camelCase and snake_case input
    const partnerType = req.body.partnerType || req.body.partner_type || 'BAAS';
    const contactPerson = req.body.contactPerson || req.body.contact_person;
    const contactEmail = req.body.contactEmail || req.body.contact_email;
    const contactPhone = req.body.contactPhone || req.body.contact_phone;
    const registrationNumber = req.body.registrationNumber || req.body.registration_number;
    const taxId = req.body.taxId || req.body.tax_id;
    const apiEndpoint = req.body.apiEndpoint || req.body.api_endpoint;
    const apiKeyEncrypted = req.body.apiKeyEncrypted || req.body.api_key_encrypted;
    const sftpHost = req.body.sftpHost || req.body.sftp_host;
    const sftpUsername = req.body.sftpUsername || req.body.sftp_username;
    const submittedBy = req.body.submittedBy || req.body.submitted_by || 'admin@superapp.com';

    db.run(`INSERT INTO partners (id, code, name, partner_type, description, status, contact_person, 
      contact_email, contact_phone, website, registration_number, tax_id, address, api_endpoint, 
      api_key_encrypted, sftp_host, sftp_username, submitted_by, submitted_at, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.body.code, req.body.name, partnerType, req.body.description, 'PENDING_APPROVAL',
       contactPerson, contactEmail, contactPhone, req.body.website,
       registrationNumber, taxId, req.body.address, apiEndpoint,
       apiKeyEncrypted, sftpHost, sftpUsername,
       submittedBy, now, now, now],
      function(err) {
        if (err) {
          console.error('Error inserting partner:', err);
          return res.status(500).json({ error: err.message, details: 'Failed to create partner' });
        }
        
        try {
          // Map to products if provided
          if (req.body.products && Array.isArray(req.body.products) && req.body.products.length > 0) {
            let completedMappings = 0;
            const totalMappings = req.body.products.length;
            
            req.body.products.forEach(productId => {
              const ppId = uuidv4();
              db.run('INSERT INTO product_partners (id, product_id, partner_id, status, mapped_at, mapped_by) VALUES (?, ?, ?, ?, ?, ?)',
                [ppId, productId, id, 'ACTIVE', new Date().toISOString(), 'admin@superapp.com'],
                function(err) {
                  if (err) {
                    console.error('Error mapping partner to product:', err);
                  }
                  completedMappings++;
                  
                  // When all mappings are done, create approval and return response
                  if (completedMappings === totalMappings) {
                    try {
                      createApproval('PARTNER', id, submittedBy);
                    } catch (approvalErr) {
                      console.error('Error creating approval:', approvalErr);
                    }
                    
                    // Return transformed partner
                    db.get('SELECT * FROM partners WHERE id = ?', [id], (err, row) => {
                      if (err) {
                        console.error('Error fetching created partner:', err);
                        return res.status(500).json({ error: err.message, details: 'Partner created but error fetching details' });
                      }
                      if (!row) {
                        return res.status(404).json({ error: 'Partner not found after creation' });
                      }
                      res.status(201).json(transformPartner(row));
                    });
                  }
                }
              );
            });
          } else {
            // No products to map, create approval and return
            try {
              createApproval('PARTNER', id, submittedBy);
            } catch (approvalErr) {
              console.error('Error creating approval:', approvalErr);
            }
            
            // Return transformed partner
            db.get('SELECT * FROM partners WHERE id = ?', [id], (err, row) => {
              if (err) {
                console.error('Error fetching created partner:', err);
                return res.status(500).json({ error: err.message, details: 'Partner created but error fetching details' });
              }
              if (!row) {
                return res.status(404).json({ error: 'Partner not found after creation' });
              }
              res.status(201).json(transformPartner(row));
            });
          }
        } catch (mappingErr) {
          console.error('Error in product mapping logic:', mappingErr);
          // Partner was created, so still return success
          db.get('SELECT * FROM partners WHERE id = ?', [id], (err, row) => {
            if (err || !row) {
              return res.status(500).json({ error: 'Partner created but error fetching details' });
            }
            res.status(201).json(transformPartner(row));
          });
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in POST /partners:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error', 
      details: 'Unexpected error creating partner' 
    });
  }
});

/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     tags: [Partners]
 *     summary: Update a partner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *       404:
 *         description: Partner not found
 */
app.put('/api/marketplace/partners/:id', (req, res) => {
  const updates = req.body;
  
  // Map camelCase to snake_case for database
  const fieldMapping = {
    'type': 'partner_type',
    'partnerType': 'partner_type',
    'contactPerson': 'contact_person',
    'contactEmail': 'contact_email',
    'contactPhone': 'contact_phone',
    'registrationNumber': 'registration_number',
    'taxId': 'tax_id',
    'apiEndpoint': 'api_endpoint',
    'apiKeyEncrypted': 'api_key_encrypted',
    'sftpHost': 'sftp_host',
    'sftpUsername': 'sftp_username',
    'submittedBy': 'submitted_by',
    'submittedAt': 'submitted_at',
    'approvedAt': 'approved_at',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  };

  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    // Skip special fields and fields that don't exist in database
    if (key !== 'id' && key !== 'products' && key !== 'createdAt' && key !== 'webhookUrl') {
      const dbColumn = fieldMapping[key] || key;
      fields.push(`${dbColumn} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(req.params.id);

  db.run(`UPDATE partners SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) {
      console.error('Error updating partner:', err);
      return res.status(500).json({ error: err.message, details: 'Failed to update partner' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    db.get('SELECT * FROM partners WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Error fetching updated partner:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(transformPartner(row));
    });
  });
});

/**
 * @swagger
 * /partners/{id}/approve:
 *   patch:
 *     tags: [Partners]
 *     summary: Approve a partner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner approved successfully
 */
app.patch('/api/marketplace/partners/:id/approve', (req, res) => {
  const now = new Date().toISOString();
  db.run('UPDATE partners SET status = ?, approved_at = ?, updated_at = ? WHERE id = ?',
    ['ACTIVE', now, now, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('UPDATE approvals SET status = ?, approved_by = ?, approved_at = ? WHERE item_id = ? AND item_type = ?',
      ['APPROVED', 'admin@superapp.com', now, req.params.id, 'PARTNER']);
    
    db.get('SELECT * FROM partners WHERE id = ?', [req.params.id], (err, row) => {
      res.json(transformPartner(row));
    });
  });
});

/**
 * @swagger
 * /partners/{id}/reject:
 *   patch:
 *     tags: [Partners]
 *     summary: Reject a partner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner rejected successfully
 */
app.patch('/api/marketplace/partners/:id/reject', (req, res) => {
  const now = new Date().toISOString();
  db.run('UPDATE partners SET status = ?, updated_at = ? WHERE id = ?',
    ['REJECTED', now, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('UPDATE approvals SET status = ?, rejected_by = ?, rejected_at = ?, rejection_reason = ? WHERE item_id = ? AND item_type = ?',
      ['REJECTED', 'admin@superapp.com', now, req.body.reason || 'Not meeting requirements', req.params.id, 'PARTNER']);
    
    db.get('SELECT * FROM partners WHERE id = ?', [req.params.id], (err, row) => {
      res.json(transformPartner(row));
    });
  });
});

/**
 * @swagger
 * /partners/{id}:
 *   delete:
 *     tags: [Partners]
 *     summary: Delete a partner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Partner deleted successfully
 *       404:
 *         description: Partner not found
 */
app.delete('/api/marketplace/partners/:id', (req, res) => {
  db.run('DELETE FROM partners WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });
});

// ============================================
// ASSET ROUTES
// ============================================

// Helper function to transform asset from DB to API format
const transformAsset = (row) => ({
  id: row.id,
  productId: row.product_id,
  partnerId: row.partner_id,
  code: row.code,
  name: row.name,
  assetType: row.asset_type,
  description: row.description,
  currentPrice: row.price || row.current_price, // PostgreSQL uses 'price' column
  price: row.price, // Also include as 'price' for compatibility
  currency: row.currency || row.price_currency,
  minInvestment: row.min_investment,
  investmentAmount: row.investment_amount,
  indicativeUnits: row.indicative_units,
  indicativeNavpu: row.indicative_navpu,
  navAsOfDate: row.nav_as_of_date,
  riskLevel: row.risk_level,
  status: row.status,
  submittedBy: row.submitted_by,
  submittedAt: row.submitted_at,
  approvedAt: row.approved_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  productName: row.product_name,
  partnerName: row.partner_name
});

/**
 * @swagger
 * /assets:
 *   get:
 *     tags: [Assets]
 *     summary: Get all assets
 *     responses:
 *       200:
 *         description: List of all assets with product and partner names
 */
app.get('/api/marketplace/assets', (req, res) => {
  // Support filtering by status query parameter
  const { status } = req.query;
  
  let query = `SELECT a.*, p.name as product_name, pr.name as partner_name 
    FROM assets a 
    LEFT JOIN products p ON a.product_id = p.id 
    LEFT JOIN partners pr ON a.partner_id = pr.id`;
  
  const params = [];
  
  if (status) {
    query += ' WHERE a.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY a.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(transformAsset));
  });
});

/**
 * @swagger
 * /assets/{id}:
 *   get:
 *     tags: [Assets]
 *     summary: Get asset by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset details with product and partner information
 *       404:
 *         description: Asset not found
 */
app.get('/api/marketplace/assets/:id', (req, res) => {
  db.get(`SELECT a.*, p.name as product_name, pr.name as partner_name 
    FROM assets a 
    LEFT JOIN products p ON a.product_id = p.id 
    LEFT JOIN partners pr ON a.partner_id = pr.id 
    WHERE a.id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(transformAsset(row));
  });
});

/**
 * @swagger
 * /assets:
 *   post:
 *     tags: [Assets]
 *     summary: Create a new asset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - partnerId
 *               - name
 *               - symbol
 *               - assetCode
 *               - assetType
 *             properties:
 *               productId:
 *                 type: string
 *               partnerId:
 *                 type: string
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               assetCode:
 *                 type: string
 *               assetType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset created successfully
 */
app.post('/api/marketplace/assets', (req, res) => {
  const asset = {
    id: uuidv4(),
    ...req.body,
    status: 'PENDING_APPROVAL',
    submitted_by: req.body.submitted_by || 'admin@superapp.com',
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // PostgreSQL schema: code (not symbol/asset_code), price (not current_price)
  db.run(`INSERT INTO assets (id, product_id, partner_id, code, name, asset_type, description,
    price, currency, min_investment, risk_level, investment_amount, indicative_units,
    indicative_navpu, nav_as_of_date,
    status, submitted_by, submitted_at, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [asset.id, asset.productId, asset.partnerId, asset.code || asset.assetCode || asset.symbol, asset.name, 
     asset.assetType, asset.description, asset.price || asset.currentPrice, asset.currency || 'PHP', 
     asset.minInvestment, asset.riskLevel, asset.investmentAmount, asset.indicativeUnits, 
     asset.indicativeNavpu, asset.navAsOfDate, asset.status, asset.submitted_by, asset.submitted_at,
     asset.created_at, asset.updated_at],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      createApproval('ASSET', asset.id, asset.submitted_by);
      res.status(201).json(asset);
    }
  );
});

/**
 * @swagger
 * /assets/{id}:
 *   put:
 *     tags: [Assets]
 *     summary: Update an asset
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       404:
 *         description: Asset not found
 */
app.put('/api/marketplace/assets/:id', (req, res) => {
  const updates = req.body;
  
  // Map camelCase to snake_case for database
  const fieldMapping = {
    'productId': 'product_id',
    'partnerId': 'partner_id',
    'assetCode': 'asset_code',
    'assetType': 'asset_type',
    'currentPrice': 'current_price',
    'priceCurrency': 'price_currency',
    'minInvestment': 'min_investment',
    'maxInvestment': 'max_investment',
    'investmentAmount': 'investment_amount',
    'indicativeUnits': 'indicative_units',
    'indicativeNavpu': 'indicative_navpu',
    'navAsOfDate': 'nav_as_of_date',
    'navPerUnit': 'nav_per_unit',
    'riskLevel': 'risk_level',
    'historicalReturn': 'historical_return',
    'yearToDateReturn': 'year_to_date_return',
    'termsAndConditions': 'terms_and_conditions',
    'submittedBy': 'submitted_by',
    'submittedAt': 'submitted_at',
    'approvedAt': 'approved_at',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  };

  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (key !== 'id' && key !== 'createdAt') {
      const dbColumn = fieldMapping[key] || key;
      fields.push(`${dbColumn} = ?`);
      values.push(updates[key]);
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(req.params.id);

  db.run(`UPDATE assets SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) {
      console.error('Error updating asset:', err);
      return res.status(500).json({ error: err.message, details: 'Failed to update asset' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    db.get(`SELECT a.*, p.name as product_name, pr.name as partner_name 
      FROM assets a 
      LEFT JOIN products p ON a.product_id = p.id 
      LEFT JOIN partners pr ON a.partner_id = pr.id 
      WHERE a.id = ?`, [req.params.id], (err, row) => {
      if (err) {
        console.error('Error fetching updated asset:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(transformAsset(row));
    });
  });
});

/**
 * @swagger
 * /assets/{id}/approve:
 *   patch:
 *     tags: [Assets]
 *     summary: Approve an asset
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset approved successfully
 */
app.patch('/api/marketplace/assets/:id/approve', (req, res) => {
  const now = new Date().toISOString();
  db.run('UPDATE assets SET status = ?, approved_at = ?, updated_at = ? WHERE id = ?',
    ['ACTIVE', now, now, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('UPDATE approvals SET status = ?, approved_by = ?, approved_at = ? WHERE item_id = ? AND item_type = ?',
      ['APPROVED', 'admin@superapp.com', now, req.params.id, 'ASSET']);
    
    db.get(`SELECT a.*, p.name as product_name, pr.name as partner_name 
      FROM assets a 
      LEFT JOIN products p ON a.product_id = p.id 
      LEFT JOIN partners pr ON a.partner_id = pr.id 
      WHERE a.id = ?`, [req.params.id], (err, row) => {
      res.json(transformAsset(row));
    });
  });
});

/**
 * @swagger
 * /assets/{id}/reject:
 *   patch:
 *     tags: [Assets]
 *     summary: Reject an asset
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asset rejected successfully
 */
app.patch('/api/marketplace/assets/:id/reject', (req, res) => {
  const now = new Date().toISOString();
  db.run('UPDATE assets SET status = ?, updated_at = ? WHERE id = ?',
    ['SUSPENDED', now, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('UPDATE approvals SET status = ?, rejected_by = ?, rejected_at = ?, rejection_reason = ? WHERE item_id = ? AND item_type = ?',
      ['REJECTED', 'admin@superapp.com', now, req.body.reason || 'Not meeting requirements', req.params.id, 'ASSET']);
    
    db.get(`SELECT a.*, p.name as product_name, pr.name as partner_name 
      FROM assets a 
      LEFT JOIN products p ON a.product_id = p.id 
      LEFT JOIN partners pr ON a.partner_id = pr.id 
      WHERE a.id = ?`, [req.params.id], (err, row) => {
      res.json(transformAsset(row));
    });
  });
});

/**
 * @swagger
 * /assets/{id}:
 *   delete:
 *     tags: [Assets]
 *     summary: Delete an asset
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Asset deleted successfully
 *       404:
 *         description: Asset not found
 */
app.delete('/api/marketplace/assets/:id', (req, res) => {
  db.run('DELETE FROM assets WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });
});

// ============================================
// APPROVAL ROUTES
// ============================================

/**
 * @swagger
 * /approvals:
 *   get:
 *     tags: [Approvals]
 *     summary: Get all approvals
 *     description: Retrieve all approval requests across all item types
 *     responses:
 *       200:
 *         description: List of all approvals
 */
app.get('/api/marketplace/approvals', (req, res) => {
  db.all('SELECT * FROM approvals ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /approvals/pending:
 *   get:
 *     tags: [Approvals]
 *     summary: Get pending approvals
 *     description: Retrieve all approval requests with pending status
 *     responses:
 *       200:
 *         description: List of pending approvals
 */
app.get('/api/marketplace/approvals/pending', (req, res) => {
  db.all('SELECT * FROM approvals WHERE status = ? ORDER BY created_at DESC', ['PENDING'], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /approvals/{id}/approve:
 *   patch:
 *     tags: [Approvals]
 *     summary: Approve an approval request
 *     description: Approve a pending approval request and update the associated item status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Approval request approved successfully
 *       404:
 *         description: Approval request not found
 */
app.patch('/api/marketplace/approvals/:id/approve', (req, res) => {
  const now = new Date().toISOString();
  
  db.get('SELECT * FROM approvals WHERE id = ?', [req.params.id], (err, approval) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!approval) return res.status(404).json({ error: 'Not found' });
    
    db.run('UPDATE approvals SET status = ?, approved_by = ?, approved_at = ? WHERE id = ?',
      ['APPROVED', 'admin@superapp.com', now, req.params.id]);
    
    // Update the actual item
    const table = approval.item_type.toLowerCase() + 's';
    const statusValue = approval.item_type === 'PARTNER' ? 'ACTIVE' : 'APPROVED';
    
    db.run(`UPDATE ${table} SET status = ?, approved_at = ? WHERE id = ?`,
      [statusValue, now, approval.item_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM approvals WHERE id = ?', [req.params.id], (err, row) => {
          res.json(row);
        });
      });
  });
});

/**
 * @swagger
 * /approvals/{id}/reject:
 *   patch:
 *     tags: [Approvals]
 *     summary: Reject an approval request
 *     description: Reject a pending approval request and update the associated item status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Approval request rejected successfully
 *       404:
 *         description: Approval request not found
 */
app.patch('/api/marketplace/approvals/:id/reject', (req, res) => {
  const now = new Date().toISOString();
  
  db.get('SELECT * FROM approvals WHERE id = ?', [req.params.id], (err, approval) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!approval) return res.status(404).json({ error: 'Not found' });
    
    db.run('UPDATE approvals SET status = ?, rejected_by = ?, rejected_at = ?, rejection_reason = ? WHERE id = ?',
      ['REJECTED', 'admin@superapp.com', now, req.body.reason || 'Not meeting requirements', req.params.id]);
    
    // Update the actual item
    const table = approval.item_type.toLowerCase() + 's';
    const statusValue = approval.item_type === 'ASSET' ? 'SUSPENDED' : 'REJECTED';
    
    db.run(`UPDATE ${table} SET status = ? WHERE id = ?`,
      [statusValue, approval.item_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM approvals WHERE id = ?', [req.params.id], (err, row) => {
          res.json(row);
        });
      });
  });
});

// ============================================
// CHANGE REQUEST ROUTES
// ============================================

// Helper function to transform change request from DB to API format
const transformChangeRequest = (row) => ({
  id: row.id,
  productId: row.product_id,
  action: row.change_type,
  changeType: row.change_type,
  fieldName: row.field_name,
  oldValue: row.old_value,
  newValue: row.new_value,
  currentValue: row.old_value,
  proposedValue: row.new_value,
  status: row.status,
  requestedBy: row.requested_by,
  requestedAt: row.requested_at,
  reviewedBy: row.reviewed_by,
  reviewedAt: row.reviewed_at,
  rejectionReason: row.rejection_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

/**
 * @swagger
 * /change-requests:
 *   get:
 *     tags: [Change Requests]
 *     summary: Get all change requests
 *     description: Retrieve all configuration change requests
 *     responses:
 *       200:
 *         description: List of all change requests
 */
app.get('/api/marketplace/change-requests', (req, res) => {
  db.all('SELECT * FROM change_requests ORDER BY requested_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(transformChangeRequest));
  });
});

/**
 * @swagger
 * /change-requests/pending:
 *   get:
 *     tags: [Change Requests]
 *     summary: Get pending change requests
 *     description: Retrieve all change requests with pending status
 *     responses:
 *       200:
 *         description: List of pending change requests
 */
app.get('/api/marketplace/change-requests/pending', (req, res) => {
  db.all('SELECT * FROM change_requests WHERE status = ? ORDER BY requested_at DESC', ['PENDING'], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(transformChangeRequest));
  });
});

/**
 * @swagger
 * /change-requests:
 *   post:
 *     tags: [Change Requests]
 *     summary: Create a new change request
 *     description: Submit a configuration change request for approval
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - action
 *               - currentValue
 *               - proposedValue
 *             properties:
 *               productId:
 *                 type: string
 *               action:
 *                 type: string
 *               currentValue:
 *                 type: string
 *               proposedValue:
 *                 type: string
 *     responses:
 *       201:
 *         description: Change request created successfully
 */
app.post('/api/marketplace/change-requests', (req, res) => {
  // Map frontend fields to backend fields
  const changeType = req.body.action || req.body.changeType;
  const oldValue = String(req.body.currentValue !== undefined ? req.body.currentValue : req.body.oldValue || '');
  const newValue = String(req.body.proposedValue !== undefined ? req.body.proposedValue : req.body.newValue || '');
  
  const changeRequest = {
    id: uuidv4(),
    productId: req.body.productId,
    productCode: req.body.productCode,
    productName: req.body.productName,
    action: req.body.action,
    changeType: changeType,
    oldValue: oldValue,
    newValue: newValue,
    currentValue: req.body.currentValue,
    proposedValue: req.body.proposedValue,
    status: 'PENDING',
    requested_by: req.body.requested_by || 'admin@superapp.com',
    requested_at: new Date().toISOString()
  };

  // PostgreSQL schema: id, product_id, change_type, old_value, new_value, status, requested_by, requested_at
  db.run(`INSERT INTO change_requests (id, product_id, change_type, old_value, new_value, status, 
    requested_by, requested_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [changeRequest.id, changeRequest.productId, changeType,
     oldValue, newValue, changeRequest.status, changeRequest.requested_by,
     changeRequest.requested_at],
    function(err) {
      if (err) {
        console.error('Error inserting change request:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(changeRequest);
    }
  );
});

/**
 * @swagger
 * /change-requests/{id}/approve:
 *   patch:
 *     tags: [Change Requests]
 *     summary: Approve a change request
 *     description: Approve a change request and apply the configuration change
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Change request approved successfully
 *       404:
 *         description: Change request not found
 */
app.patch('/api/marketplace/change-requests/:id/approve', (req, res) => {
  const now = new Date().toISOString();
  
  db.get('SELECT * FROM change_requests WHERE id = ?', [req.params.id], (err, cr) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!cr) return res.status(404).json({ error: 'Not found' });
    
    db.run('UPDATE change_requests SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?',
      ['APPROVED', 'admin@superapp.com', now, req.params.id]);
    
    // Apply the change
    db.run(`UPDATE products SET ${cr.field_name} = ? WHERE id = ?`,
      [cr.new_value, cr.product_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get('SELECT * FROM change_requests WHERE id = ?', [req.params.id], (err, row) => {
          res.json(row);
        });
      });
  });
});

/**
 * @swagger
 * /change-requests/{id}/reject:
 *   patch:
 *     tags: [Change Requests]
 *     summary: Reject a change request
 *     description: Reject a change request and do not apply the configuration change
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Change request rejected successfully
 *       404:
 *         description: Change request not found
 */
app.patch('/api/marketplace/change-requests/:id/reject', (req, res) => {
  const now = new Date().toISOString();
  db.run('UPDATE change_requests SET status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ? WHERE id = ?',
    ['REJECTED', 'admin@superapp.com', now, req.body.reason || 'Not approved', req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get('SELECT * FROM change_requests WHERE id = ?', [req.params.id], (err, row) => {
        res.json(row);
      });
    }
  );
});

// ============================================
// FEATURE ROUTES
// ============================================

/**
 * @swagger
 * /features:
 *   get:
 *     tags: [Features]
 *     summary: Get all features
 *     description: Retrieve all feature flags across all products
 *     responses:
 *       200:
 *         description: List of all features
 */
app.get('/api/marketplace/features', (req, res) => {
  db.all('SELECT * FROM features ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /features/product/{productId}:
 *   get:
 *     tags: [Features]
 *     summary: Get features by product ID
 *     description: Retrieve all top-level features for a specific product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of features for the product
 */
app.get('/api/marketplace/features/product/:productId', (req, res) => {
  db.all('SELECT * FROM features WHERE product_id = ? AND parent_feature_id IS NULL', [req.params.productId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /features:
 *   post:
 *     tags: [Features]
 *     summary: Create a new feature
 *     description: Create a new feature flag for a product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - name
 *               - code
 *             properties:
 *               productId:
 *                 type: string
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *               maintenanceMode:
 *                 type: boolean
 *               whitelistMode:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Feature created successfully
 */
app.post('/api/marketplace/features', (req, res) => {
  const feature = {
    id: uuidv4(),
    ...req.body,
    enabled: req.body.enabled !== undefined ? req.body.enabled : true,
    maintenance_mode: req.body.maintenanceMode ? 1 : 0,
    whitelist_mode: req.body.whitelistMode ? 1 : 0,
    rollout_percentage: req.body.rolloutPercentage || 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.run(`INSERT INTO features (id, product_id, parent_feature_id, name, code, description, feature_type,
    enabled, maintenance_mode, whitelist_mode, rollout_percentage, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [feature.id, feature.productId, feature.parentFeatureId, feature.name, feature.code, feature.description,
     feature.featureType, feature.enabled ? 1 : 0, feature.maintenance_mode, feature.whitelist_mode,
     feature.rollout_percentage, feature.created_at, feature.updated_at],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(feature);
    }
  );
});

/**
 * @swagger
 * /features/{id}:
 *   put:
 *     tags: [Features]
 *     summary: Update a feature
 *     description: Update feature flag settings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Feature updated successfully
 *       404:
 *         description: Feature not found
 */
app.put('/api/marketplace/features/:id', (req, res) => {
  const updates = req.body;
  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      if (typeof updates[key] === 'boolean') {
        values.push(updates[key] ? 1 : 0);
      } else {
        values.push(updates[key]);
      }
    }
  });

  values.push(new Date().toISOString());
  fields.push('updated_at = ?');
  values.push(req.params.id);

  db.run(`UPDATE features SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get('SELECT * FROM features WHERE id = ?', [req.params.id], (err, row) => {
      res.json(row);
    });
  });
});

/**
 * @swagger
 * /features/{id}:
 *   delete:
 *     tags: [Features]
 *     summary: Delete a feature
 *     description: Delete a feature flag
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Feature deleted successfully
 *       404:
 *         description: Feature not found
 */
app.delete('/api/marketplace/features/:id', (req, res) => {
  db.run('DELETE FROM features WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

// ============================================
// GREYLIST ROUTES
// ============================================

/**
 * @swagger
 * /greylist:
 *   get:
 *     tags: [Greylist]
 *     summary: Get all greylist entries
 *     description: Retrieve all whitelist and blacklist entries
 *     responses:
 *       200:
 *         description: List of all greylist entries
 */
app.get('/api/marketplace/greylist', (req, res) => {
  db.all('SELECT * FROM greylist ORDER BY added_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /greylist/type/{listType}:
 *   get:
 *     tags: [Greylist]
 *     summary: Get greylist entries by type
 *     description: Retrieve whitelist or blacklist entries
 *     parameters:
 *       - in: path
 *         name: listType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [WHITELIST, BLACKLIST]
 *     responses:
 *       200:
 *         description: List of greylist entries by type
 */
app.get('/api/marketplace/greylist/type/:listType', (req, res) => {
  db.all('SELECT * FROM greylist WHERE list_type = ? ORDER BY added_at DESC', [req.params.listType], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /greylist:
 *   post:
 *     tags: [Greylist]
 *     summary: Add a greylist entry
 *     description: Add a user to whitelist or blacklist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listType
 *             properties:
 *               userId:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               msisdn:
 *                 type: string
 *               productId:
 *                 type: string
 *               listType:
 *                 type: string
 *                 enum: [WHITELIST, BLACKLIST]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Greylist entry created successfully
 */
app.post('/api/marketplace/greylist', (req, res) => {
  const entry = {
    id: uuidv4(),
    ...req.body,
    status: req.body.status || 'ACTIVE',
    added_by: req.body.added_by || 'admin@superapp.com',
    added_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.run(`INSERT INTO greylist (id, user_id, user_email, user_name, msisdn, product_id, product_code,
    product_name, list_type, reason, status, expires_at, added_by, added_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [entry.id, entry.userId, entry.userEmail, entry.userName, entry.msisdn, entry.productId,
     entry.productCode, entry.productName, entry.listType, entry.reason, entry.status,
     entry.expiresAt, entry.added_by, entry.added_at, entry.updated_at],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(entry);
    }
  );
});

/**
 * @swagger
 * /greylist/{id}:
 *   put:
 *     tags: [Greylist]
 *     summary: Update a greylist entry
 *     description: Update whitelist or blacklist entry details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Greylist entry updated successfully
 *       404:
 *         description: Greylist entry not found
 */
app.put('/api/marketplace/greylist/:id', (req, res) => {
  const updates = req.body;
  const fields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(updates[key]);
    }
  });

  values.push(new Date().toISOString());
  fields.push('updated_at = ?');
  values.push(req.params.id);

  db.run(`UPDATE greylist SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get('SELECT * FROM greylist WHERE id = ?', [req.params.id], (err, row) => {
      res.json(row);
    });
  });
});

/**
 * @swagger
 * /greylist/{id}:
 *   delete:
 *     tags: [Greylist]
 *     summary: Delete a greylist entry
 *     description: Remove a user from whitelist or blacklist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Greylist entry deleted successfully
 *       404:
 *         description: Greylist entry not found
 */
app.delete('/api/marketplace/greylist/:id', (req, res) => {
  db.run('DELETE FROM greylist WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message  });
    res.status(204).send();
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Check if the API server is running
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 timestamp:
 *                   type: string
 *                   example: 2025-10-13T17:47:11.885Z
 */
app.get('/api/marketplace/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// ============================================
// REPORTS ENDPOINTS (Mock Implementation)
// ============================================

app.get('/api/marketplace/reports/data-sources', (req, res) => {
  res.json([
    {
      id: 'products',
      name: 'Products',
      table: 'products',
      description: 'Product data',
      fields: [
        { id: 'id', name: 'ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'name', name: 'Name', column: 'name', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'status', name: 'Status', column: 'status', type: 'string', aggregatable: false, filterable: true, sortable: true },
      ]
    },
    {
      id: 'customers',
      name: 'Customers',
      table: 'customers',
      description: 'Customer data',
      fields: [
        { id: 'id', name: 'ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'email', name: 'Email', column: 'email', type: 'string', aggregatable: false, filterable: true, sortable: true },
      ]
    }
  ]);
});

/**
 * @swagger
 * /reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get all reports
 *     description: Retrieve all saved report configurations
 *     responses:
 *       200:
 *         description: List of reports
 */
app.get('/api/marketplace/reports', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /reports:
 *   post:
 *     tags: [Reports]
 *     summary: Create a report
 *     description: Create a new report configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Report created successfully
 */
app.post('/api/marketplace/reports', (req, res) => {
  const report = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  res.status(201).json(report);
});

/**
 * @swagger
 * /reports/{id}:
 *   put:
 *     tags: [Reports]
 *     summary: Update a report
 *     description: Update report configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Report updated successfully
 */
app.put('/api/marketplace/reports/:id', (req, res) => {
  res.json({ ...req.body, id: req.params.id, updatedAt: new Date().toISOString() });
});

/**
 * @swagger
 * /reports/execute:
 *   post:
 *     tags: [Reports]
 *     summary: Execute a report
 *     description: Execute a report and return results
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Report executed successfully
 */
app.post('/api/marketplace/reports/execute', (req, res) => {
  res.json({
    columns: [{ field: 'id', label: 'ID', type: 'string' }],
    data: [],
    totalRows: 0,
    executionTime: 100
  });
});

// ============================================
// SCHEDULED TASKS ENDPOINTS (Mock Implementation)
// ============================================

/**
 * @swagger
 * /scheduled-tasks:
 *   get:
 *     tags: [Scheduled Tasks]
 *     summary: Get all scheduled tasks
 *     description: Retrieve all configured scheduled tasks
 *     responses:
 *       200:
 *         description: List of scheduled tasks
 */
app.get('/api/marketplace/scheduled-tasks', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /scheduled-tasks/{id}:
 *   get:
 *     tags: [Scheduled Tasks]
 *     summary: Get scheduled task by ID
 *     description: Retrieve a specific scheduled task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled task details
 *       404:
 *         description: Scheduled task not found
 */
app.get('/api/marketplace/scheduled-tasks/:id', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * @swagger
 * /scheduled-tasks:
 *   post:
 *     tags: [Scheduled Tasks]
 *     summary: Create a scheduled task
 *     description: Create a new scheduled task configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Scheduled task created successfully
 */
app.post('/api/marketplace/scheduled-tasks', (req, res) => {
  const task = { id: uuidv4(), ...req.body, status: 'ACTIVE', createdAt: new Date().toISOString() };
  res.status(201).json(task);
});

/**
 * @swagger
 * /scheduled-tasks/{id}:
 *   put:
 *     tags: [Scheduled Tasks]
 *     summary: Update a scheduled task
 *     description: Update scheduled task configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Scheduled task updated successfully
 */
app.put('/api/marketplace/scheduled-tasks/:id', (req, res) => {
  res.json({ ...req.body, id: req.params.id, updatedAt: new Date().toISOString() });
});

/**
 * @swagger
 * /scheduled-tasks/{id}:
 *   delete:
 *     tags: [Scheduled Tasks]
 *     summary: Delete a scheduled task
 *     description: Remove a scheduled task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Scheduled task deleted successfully
 */
app.delete('/api/marketplace/scheduled-tasks/:id', (req, res) => {
  res.status(204).send();
});

// ============================================
// ELIGIBILITY ENDPOINTS (Mock Implementation)
// ============================================

/**
 * @swagger
 * /eligibility:
 *   get:
 *     tags: [Eligibility]
 *     summary: Get all eligibility rules
 *     description: Retrieve all eligibility rules and criteria
 *     responses:
 *       200:
 *         description: List of eligibility rules
 */
app.get('/api/marketplace/eligibility', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /eligibility:
 *   post:
 *     tags: [Eligibility]
 *     summary: Create an eligibility rule
 *     description: Create a new eligibility rule or criteria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Eligibility rule created successfully
 */
app.post('/api/marketplace/eligibility', (req, res) => {
  const rule = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  res.status(201).json(rule);
});

/**
 * @swagger
 * /eligibility/{id}:
 *   put:
 *     tags: [Eligibility]
 *     summary: Update an eligibility rule
 *     description: Update eligibility rule details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Eligibility rule updated successfully
 */
app.put('/api/marketplace/eligibility/:id', (req, res) => {
  res.json({ ...req.body, id: req.params.id, updatedAt: new Date().toISOString() });
});

/**
 * @swagger
 * /eligibility/{id}:
 *   delete:
 *     tags: [Eligibility]
 *     summary: Delete an eligibility rule
 *     description: Remove an eligibility rule
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Eligibility rule deleted successfully
 */
app.delete('/api/marketplace/eligibility/:id', (req, res) => {
  res.status(204).send();
});

// ============================================
// DATA POINTS ENDPOINTS (Mock Implementation)
// ============================================

/**
 * @swagger
 * /data-points:
 *   get:
 *     tags: [Data Points]
 *     summary: Get all data points
 *     description: Retrieve all configured data points
 *     responses:
 *       200:
 *         description: List of data points
 */
app.get('/api/marketplace/data-points', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /data-points:
 *   post:
 *     tags: [Data Points]
 *     summary: Create a data point
 *     description: Create a new data point configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Data point created successfully
 */
app.post('/api/marketplace/data-points', (req, res) => {
  const dataPoint = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  res.status(201).json(dataPoint);
});

/**
 * @swagger
 * /data-points/{id}:
 *   put:
 *     tags: [Data Points]
 *     summary: Update a data point
 *     description: Update data point configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data point updated successfully
 */
app.put('/api/marketplace/data-points/:id', (req, res) => {
  res.json({ ...req.body, id: req.params.id, updatedAt: new Date().toISOString() });
});

/**
 * @swagger
 * /data-points/{id}:
 *   delete:
 *     tags: [Data Points]
 *     summary: Delete a data point
 *     description: Remove a data point configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Data point deleted successfully
 */
app.delete('/api/marketplace/data-points/:id', (req, res) => {
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Marketplace API Server Running       ║
║   📍 http://localhost:${PORT}/api/marketplace ║
║   📊 Database: PostgreSQL (Persistent)    ║
║   📚 Docs: /api/marketplace/docs          ║
║   ✅ Ready to accept requests!            ║
╚═══════════════════════════════════════════╝
  `);
});

