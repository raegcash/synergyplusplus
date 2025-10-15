#!/usr/bin/env node
/**
 * Add Sample Partner-Submitted Assets
 * 
 * This script adds sample partner-submitted assets to the database
 * for testing the Partner Asset Requests feature.
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'marketplace.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Sample partner-submitted assets
const sampleAssets = [
  {
    code: 'BTC',
    name: 'Bitcoin',
    assetType: 'CRYPTO',
    description: 'Bitcoin is a decentralized digital currency without a central bank or single administrator.',
    category: 'Cryptocurrency',
    price: 67500.00,
    currency: 'USD',
    minInvestment: 500,
    marketCap: '1.3T',
    change24h: 5.3,
    riskLevel: 'HIGH',
    submittedBy: 'TechInvest Corp API',
    submissionSource: 'PARTNER_API',
    partnerCode: 'TECHINV', // We'll look up the actual partner ID
  },
  {
    code: 'ETH',
    name: 'Ethereum',
    assetType: 'CRYPTO',
    description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.',
    category: 'Cryptocurrency',
    price: 3500.00,
    currency: 'USD',
    minInvestment: 500,
    marketCap: '420B',
    change24h: 3.8,
    riskLevel: 'HIGH',
    submittedBy: 'TechInvest Corp API',
    submissionSource: 'PARTNER_API',
    partnerCode: 'TECHINV',
  },
  {
    code: 'SOL',
    name: 'Solana',
    assetType: 'CRYPTO',
    description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps.',
    category: 'Cryptocurrency',
    price: 145.20,
    currency: 'USD',
    minInvestment: 500,
    marketCap: '65B',
    change24h: 8.5,
    riskLevel: 'VERY_HIGH',
    submittedBy: 'TechInvest Corp API',
    submissionSource: 'PARTNER_API',
    partnerCode: 'TECHINV',
  },
  {
    code: 'TSLA',
    name: 'Tesla, Inc.',
    assetType: 'STOCK',
    description: 'Tesla designs, develops, manufactures, and sells electric vehicles and energy generation products.',
    category: 'Technology',
    price: 248.50,
    currency: 'USD',
    minInvestment: 1000,
    marketCap: '790B',
    change24h: -2.3,
    riskLevel: 'MEDIUM',
    submittedBy: 'Global Securities API',
    submissionSource: 'PARTNER_API',
    partnerCode: 'GLOBSEC',
  },
  {
    code: 'NVDA',
    name: 'NVIDIA Corporation',
    assetType: 'STOCK',
    description: 'NVIDIA Corporation is a leader in artificial intelligence hardware and software.',
    category: 'Technology',
    price: 875.30,
    currency: 'USD',
    minInvestment: 1000,
    marketCap: '2.1T',
    change24h: 4.7,
    riskLevel: 'MEDIUM',
    submittedBy: 'Global Securities API',
    submissionSource: 'PARTNER_API',
    partnerCode: 'GLOBSEC',
  },
  {
    code: 'BPI-BALANCED',
    name: 'BPI Balanced Fund',
    assetType: 'UITF',
    description: 'A balanced fund that invests in a mix of equities and fixed income securities.',
    category: 'Balanced Fund',
    price: 1.8450,
    currency: 'PHP',
    minInvestment: 10000,
    marketCap: '5.2B',
    change24h: 0.15,
    riskLevel: 'MEDIUM',
    navPerUnit: 1.8450,
    fundManager: 'BPI Asset Management',
    fundHouse: 'BPI',
    submittedBy: 'Acme Financial API',
    submissionSource: 'PARTNER_API',
    partnerCode: 'ACME',
  },
];

async function addSampleAssets() {
  try {
    console.log('\n📊 Adding sample partner-submitted assets...\n');

    // First, check if we need to add the new columns
    await addMissingColumns();

    // Get available products and partners
    const products = await getProducts();
    const partners = await getPartners();

    if (products.length === 0 || partners.length === 0) {
      console.error('❌ No products or partners found. Please create products and partners first.');
      db.close();
      process.exit(1);
    }

    console.log(`Found ${products.length} products and ${partners.length} partners\n`);

    // Insert sample assets
    for (const assetData of sampleAssets) {
      try {
        // Find partner by code
        const partner = partners.find(p => p.code === assetData.partnerCode);
        if (!partner) {
          console.log(`⚠️  Skipping ${assetData.code} - Partner ${assetData.partnerCode} not found`);
          continue;
        }

        // Find a product that's mapped to this partner
        const product = products.find(p => {
          // For crypto assets, try to find a crypto product
          if (assetData.assetType === 'CRYPTO') {
            return p.product_type === 'CRYPTO' || p.name.toLowerCase().includes('crypto');
          }
          // For stocks, try to find an investment product
          if (assetData.assetType === 'STOCK') {
            return p.product_type === 'INVESTMENT' || p.name.toLowerCase().includes('stock');
          }
          // For UITF, try to find an investment product
          if (assetData.assetType === 'UITF') {
            return p.product_type === 'INVESTMENT';
          }
          return true; // Any product
        });

        if (!product) {
          console.log(`⚠️  Skipping ${assetData.code} - No suitable product found`);
          continue;
        }

        // Check if asset already exists
        const existing = await checkAssetExists(assetData.code);
        if (existing) {
          console.log(`⏭️  Skipping ${assetData.code} - Already exists`);
          continue;
        }

        const asset = {
          id: uuidv4(),
          product_id: product.id,
          partner_id: partner.id,
          code: assetData.code,
          name: assetData.name,
          asset_type: assetData.assetType,
          description: assetData.description,
          category: assetData.category,
          price: assetData.price,
          currency: assetData.currency,
          min_investment: assetData.minInvestment,
          risk_level: assetData.riskLevel,
          status: 'PENDING_APPROVAL',
          submission_source: assetData.submissionSource,
          market_cap: assetData.marketCap,
          change_24h: assetData.change24h,
          submitted_by: assetData.submittedBy,
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await insertAsset(asset);
        await createApproval('ASSET', asset.id, asset.submitted_by);

        console.log(`✅ Added: ${asset.name} (${asset.code}) - ${asset.submission_source}`);
      } catch (err) {
        console.error(`❌ Error adding ${assetData.code}:`, err.message);
      }
    }

    console.log('\n🎉 Sample assets added successfully!\n');
    console.log('📋 To view them, navigate to:');
    console.log('   http://localhost:3000/assets/partner-requests\n');

    db.close();
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
    process.exit(1);
  }
}

// Helper functions
function addMissingColumns() {
  return new Promise((resolve, reject) => {
    // Check if columns exist and add them if they don't
    db.serialize(() => {
      // Add submission_source column
      db.run(`ALTER TABLE assets ADD COLUMN submission_source VARCHAR(50) DEFAULT 'ADMIN'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  submission_source column might already exist or error:', err.message);
        } else {
          console.log('✅ Added submission_source column');
        }
      });

      // Add market_cap column
      db.run(`ALTER TABLE assets ADD COLUMN market_cap VARCHAR(50)`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  market_cap column might already exist or error:', err.message);
        } else {
          console.log('✅ Added market_cap column');
        }
      });

      // Add change_24h column
      db.run(`ALTER TABLE assets ADD COLUMN change_24h DECIMAL(10, 4)`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  change_24h column might already exist or error:', err.message);
        } else {
          console.log('✅ Added change_24h column');
        }
      });

      // Add category column
      db.run(`ALTER TABLE assets ADD COLUMN category VARCHAR(100)`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  category column might already exist or error:', err.message);
        } else {
          console.log('✅ Added category column');
        }
      });

      // Add nav_per_unit column for UITF
      db.run(`ALTER TABLE assets ADD COLUMN nav_per_unit DECIMAL(15, 4)`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  nav_per_unit column might already exist or error:', err.message);
        } else {
          console.log('✅ Added nav_per_unit column');
        }
      });

      // Add fund_manager column
      db.run(`ALTER TABLE assets ADD COLUMN fund_manager VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  fund_manager column might already exist or error:', err.message);
        } else {
          console.log('✅ Added fund_manager column');
        }
      });

      // Add fund_house column
      db.run(`ALTER TABLE assets ADD COLUMN fund_house VARCHAR(255)`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.log('ℹ️  fund_house column might already exist or error:', err.message);
        } else {
          console.log('✅ Added fund_house column');
        }

        // Resolve after the last column
        setTimeout(resolve, 100);
      });
    });
  });
}

function getProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products WHERE status IN (?, ?)', ['ACTIVE', 'APPROVED'], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getPartners() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM partners WHERE status IN (?, ?)', ['ACTIVE', 'APPROVED'], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function checkAssetExists(code) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM assets WHERE code = ?', [code], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function insertAsset(asset) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO assets (
      id, product_id, partner_id, code, name, asset_type, description, category,
      price, currency, min_investment, risk_level, status,
      submission_source, market_cap, change_24h,
      submitted_by, submitted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      asset.id, asset.product_id, asset.partner_id, asset.code, asset.name,
      asset.asset_type, asset.description, asset.category, asset.price, asset.currency,
      asset.min_investment, asset.risk_level, asset.status,
      asset.submission_source, asset.market_cap, asset.change_24h,
      asset.submitted_by, asset.submitted_at, asset.created_at, asset.updated_at
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function createApproval(itemType, itemId, submittedBy) {
  return new Promise((resolve, reject) => {
    const approval = {
      id: uuidv4(),
      item_type: itemType,
      item_id: itemId,
      status: 'PENDING',
      submitted_by: submittedBy,
      submitted_at: new Date().toISOString(),
      current_step: 'Asset Registration',
      next_step: 'Admin Approval',
      hierarchy_level: 1,
    };

    db.run(`INSERT INTO approvals (id, item_type, item_id, status, submitted_by, submitted_at, current_step, next_step, hierarchy_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [approval.id, approval.item_type, approval.item_id, approval.status, approval.submitted_by,
       approval.submitted_at, approval.current_step, approval.next_step, approval.hierarchy_level],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Run the script
addSampleAssets();

