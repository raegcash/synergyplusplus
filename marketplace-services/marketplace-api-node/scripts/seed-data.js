/**
 * Seed Data Script
 * Populates the database with sample products, partners, assets, and other data
 */

const db = require('../config/db-compat');
const { v4: uuidv4 } = require('uuid');

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Check if data already exists
    const existingProducts = await db.all('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   Run "npm run seed:clean" to reset and reseed.\n');
      process.exit(0);
    }

    // 1. Seed Partners
    console.log('📦 Seeding partners...');
    const partners = [
      {
        id: uuidv4(),
        name: 'BDO Trust Banking',
        code: 'BDO_TRUST',
        description: 'Leading provider of Unit Investment Trust Funds (UITF) in the Philippines',
        type: 'INVESTMENT',
        status: 'ACTIVE',
        website: 'https://www.bdo.com.ph',
        contact_email: 'trust@bdo.com.ph',
        contact_phone: '+632-8840-7000',
      },
      {
        id: uuidv4(),
        name: 'COL Financial',
        code: 'COL',
        description: 'Philippine online stock brokerage platform',
        type: 'INVESTMENT',
        status: 'ACTIVE',
        website: 'https://www.colfinancial.com',
        contact_email: 'support@colfinancial.com',
        contact_phone: '+632-8651-5888',
      },
      {
        id: uuidv4(),
        name: 'Binance Philippines',
        code: 'BINANCE_PH',
        description: 'Leading cryptocurrency exchange in the Philippines',
        type: 'INVESTMENT',
        status: 'ACTIVE',
        website: 'https://www.binance.com/ph',
        contact_email: 'support@binance.com',
        contact_phone: '+632-8888-6888',
      },
    ];

    for (const partner of partners) {
      await db.run(
        `INSERT INTO partners (
          id, name, code, description, partner_type, status, 
          website, contact_email, contact_phone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partner.id,
          partner.name,
          partner.code,
          partner.description,
          partner.type,
          partner.status,
          partner.website,
          partner.contact_email,
          partner.contact_phone,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }
    console.log(`✅ Seeded ${partners.length} partners\n`);

    // 2. Seed Products
    console.log('📦 Seeding products...');
    const products = [
      {
        id: uuidv4(),
        name: 'BDO Equity Fund',
        code: 'BDO_EQUITY',
        description: 'A fund invested primarily in Philippine equities for long-term capital growth',
        product_type: 'INVESTMENT',
        status: 'ACTIVE',
        min_investment: 10000,
        max_investment: 10000000,
        risk_level: 'HIGH',
        currency: 'PHP',
      },
      {
        id: uuidv4(),
        name: 'BDO Balanced Fund',
        code: 'BDO_BALANCED',
        description: 'A balanced portfolio of equities and fixed income securities',
        product_type: 'INVESTMENT',
        status: 'ACTIVE',
        min_investment: 10000,
        max_investment: 10000000,
        risk_level: 'MODERATE',
        currency: 'PHP',
      },
      {
        id: uuidv4(),
        name: 'Philippine Stock Trading',
        code: 'PSE_STOCKS',
        description: 'Trade Philippine stocks through PSE',
        product_type: 'INVESTMENT',
        status: 'ACTIVE',
        min_investment: 5000,
        max_investment: 10000000,
        risk_level: 'HIGH',
        currency: 'PHP',
      },
      {
        id: uuidv4(),
        name: 'Cryptocurrency Trading',
        code: 'CRYPTO_TRADE',
        description: 'Buy and sell major cryptocurrencies',
        product_type: 'CRYPTO',
        status: 'ACTIVE',
        min_investment: 100,
        max_investment: 10000000,
        risk_level: 'VERY_HIGH',
        currency: 'PHP',
      },
      {
        id: uuidv4(),
        name: 'BDO Money Market Fund',
        code: 'BDO_MONEY_MARKET',
        description: 'Low-risk fund invested in short-term securities',
        product_type: 'SAVINGS',
        status: 'ACTIVE',
        min_investment: 1000,
        max_investment: 10000000,
        risk_level: 'LOW',
        currency: 'PHP',
      },
    ];

    for (const product of products) {
      await db.run(
        `INSERT INTO products (
          id, name, code, description, product_type, status,
          min_investment, max_investment, currency, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.name,
          product.code,
          product.description,
          product.product_type,
          product.status,
          product.min_investment,
          product.max_investment,
          product.currency,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }
    console.log(`✅ Seeded ${products.length} products\n`);

    // 3. Seed Assets
    console.log('📦 Seeding assets...');
    const assets = [
      // UITF Assets
      {
        id: uuidv4(),
        product_id: products[0].id, // BDO Equity
        name: 'BDO Equity Fund - Class A',
        symbol: 'BDOEQ',
        asset_type: 'UITF',
        description: 'BDO Equity Fund focused on blue-chip stocks',
        current_price: 1.5234,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[1].id, // BDO Balanced
        name: 'BDO Balanced Fund - Class A',
        symbol: 'BDOBAL',
        asset_type: 'UITF',
        description: 'BDO Balanced Fund with 60% equities and 40% fixed income',
        current_price: 1.3456,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[4].id, // Money Market
        name: 'BDO Money Market Fund',
        symbol: 'BDOMM',
        asset_type: 'UITF',
        description: 'Low-risk money market fund',
        current_price: 1.1234,
        status: 'ACTIVE',
      },
      // Stock Assets
      {
        id: uuidv4(),
        product_id: products[2].id, // PSE Stocks
        name: 'Ayala Corporation',
        symbol: 'AC',
        asset_type: 'STOCK',
        description: 'Ayala Corporation - Philippine conglomerate',
        current_price: 645.50,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        name: 'SM Investments Corporation',
        symbol: 'SM',
        asset_type: 'STOCK',
        description: 'SM Investments - Retail and property conglomerate',
        current_price: 825.00,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        name: 'Jollibee Foods Corporation',
        symbol: 'JFC',
        asset_type: 'STOCK',
        description: 'Jollibee Foods - Leading fast food chain',
        current_price: 245.80,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        name: 'BDO Unibank Inc.',
        symbol: 'BDO',
        asset_type: 'STOCK',
        description: 'BDO Unibank - Largest bank in the Philippines',
        current_price: 128.50,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        name: 'Ayala Land Inc.',
        symbol: 'ALI',
        asset_type: 'STOCK',
        description: 'Ayala Land - Leading real estate developer',
        current_price: 34.25,
        status: 'ACTIVE',
      },
      // Crypto Assets
      {
        id: uuidv4(),
        product_id: products[3].id, // Crypto
        name: 'Bitcoin',
        symbol: 'BTC',
        asset_type: 'CRYPTO',
        description: 'Bitcoin - The first and largest cryptocurrency',
        current_price: 3750000.00,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[3].id,
        name: 'Ethereum',
        symbol: 'ETH',
        asset_type: 'CRYPTO',
        description: 'Ethereum - Smart contract platform',
        current_price: 125000.00,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[3].id,
        name: 'Binance Coin',
        symbol: 'BNB',
        asset_type: 'CRYPTO',
        description: 'Binance Coin - Binance exchange token',
        current_price: 15000.00,
        status: 'ACTIVE',
      },
      {
        id: uuidv4(),
        product_id: products[3].id,
        name: 'Ripple',
        symbol: 'XRP',
        asset_type: 'CRYPTO',
        description: 'Ripple - Digital payment protocol',
        current_price: 32.50,
        status: 'ACTIVE',
      },
    ];

    for (const asset of assets) {
      await db.run(
        `INSERT INTO assets (
          id, product_id, name, code, asset_type, description,
          price, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          asset.id,
          asset.product_id,
          asset.name,
          asset.symbol,
          asset.asset_type,
          asset.description,
          asset.current_price,
          asset.status,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }
    console.log(`✅ Seeded ${assets.length} assets\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${partners.length} partners`);
    console.log(`  - ${products.length} products`);
    console.log(`  - ${assets.length} assets`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seedData();

