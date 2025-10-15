# 🔌 BACKEND INTEGRATION GUIDE

**Date**: October 15, 2025  
**Version**: 1.0.0

---

## 📋 OVERVIEW

This guide provides instructions for integrating the Client Super App with your existing marketplace API and database.

---

## ✅ EXISTING API ENDPOINTS (Already Available)

These endpoints should already exist in your marketplace API:

### Authentication
```typescript
✅ POST /api/v1/auth/login
   Request: { email: string, password: string }
   Response: { accessToken: string, refreshToken: string, user: User }

✅ POST /api/v1/auth/register
   Request: { firstName, lastName, email, password, phoneNumber? }
   Response: { user: User }

✅ POST /api/v1/auth/refresh
   Response: { accessToken: string }

✅ GET /api/v1/auth/me
   Response: { data: User }
```

### Products
```typescript
✅ GET /api/v1/products
   Query: { page?, limit?, status?, productType? }
   Response: { data: Product[], pagination: PaginationMeta }

✅ GET /api/v1/products/:id
   Response: { data: Product }
```

### Assets
```typescript
✅ GET /api/v1/assets
   Query: { page?, limit?, productId?, partnerId?, assetType? }
   Response: { data: Asset[], pagination: PaginationMeta }

✅ GET /api/v1/assets/:id
   Response: { data: Asset }
```

### Partners
```typescript
✅ GET /api/v1/partners
   Response: { data: Partner[] }
```

---

## 🆕 NEW API ENDPOINTS NEEDED

You'll need to create these new endpoints for full client functionality:

### Portfolio Management

#### 1. Get Portfolio Summary
```typescript
GET /api/v1/client/portfolio/summary

Response:
{
  "data": {
    "totalValue": 100000.00,
    "totalInvested": 95000.00,
    "totalGainLoss": 5000.00,
    "totalGainLossPercent": 5.26,
    "holdings": 5
  }
}
```

**Database Query Example:**
```sql
SELECT 
  SUM(h.quantity * h.current_price) as total_value,
  SUM(h.quantity * h.avg_purchase_price) as total_invested,
  SUM((h.current_price - h.avg_purchase_price) * h.quantity) as total_gain_loss,
  COUNT(*) as holdings
FROM portfolio_holdings h
WHERE h.user_id = ? AND h.status = 'ACTIVE'
```

#### 2. Get Portfolio Holdings
```typescript
GET /api/v1/client/portfolio/holdings

Response:
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "assetId": "uuid",
      "assetName": "BDO Equity Fund",
      "assetSymbol": "BDOEF",
      "assetType": "UITF",
      "quantity": 100,
      "avgPrice": 950.00,
      "currentPrice": 1000.00,
      "marketValue": 100000.00,
      "gainLoss": 5000.00,
      "gainLossPercent": 5.26,
      "purchaseDate": "2025-01-01T00:00:00Z",
      "status": "ACTIVE"
    }
  ]
}
```

**Database Query Example:**
```sql
SELECT 
  h.*,
  a.name as asset_name,
  a.symbol as asset_symbol,
  a.asset_type,
  a.current_price,
  h.quantity * a.current_price as market_value,
  (a.current_price - h.avg_purchase_price) * h.quantity as gain_loss,
  ((a.current_price - h.avg_purchase_price) / h.avg_purchase_price * 100) as gain_loss_percent
FROM portfolio_holdings h
JOIN assets a ON h.asset_id = a.id
WHERE h.user_id = ? AND h.status = 'ACTIVE'
ORDER BY h.created_at DESC
```

#### 3. Get Portfolio Performance
```typescript
GET /api/v1/client/portfolio/performance
Query: { startDate?, endDate? }

Response:
{
  "data": {
    "daily": [
      { "date": "2025-01-01", "value": 95000 },
      { "date": "2025-01-02", "value": 96000 }
    ],
    "summary": {
      "startValue": 95000,
      "endValue": 100000,
      "change": 5000,
      "changePercent": 5.26
    }
  }
}
```

### Transaction Management

#### 4. Get Transaction History
```typescript
GET /api/v1/transactions/history
Query: { page?, limit?, type?, status? }

Response:
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "assetId": "uuid",
      "assetName": "BDO Equity Fund",
      "assetSymbol": "BDOEF",
      "type": "BUY",
      "quantity": 100,
      "price": 950.00,
      "totalAmount": 95000.00,
      "fees": 950.00,
      "status": "COMPLETED",
      "createdAt": "2025-01-01T00:00:00Z",
      "completedAt": "2025-01-01T00:05:00Z"
    }
  ],
  "pagination": { ... }
}
```

**Database Query Example:**
```sql
SELECT 
  t.*,
  a.name as asset_name,
  a.symbol as asset_symbol
FROM transactions t
JOIN assets a ON t.asset_id = a.id
WHERE t.user_id = ?
ORDER BY t.created_at DESC
LIMIT ? OFFSET ?
```

#### 5. Create Transaction (Buy/Subscribe)
```typescript
POST /api/v1/transactions

Request:
{
  "assetId": "uuid",
  "type": "BUY" | "SUBSCRIBE",
  "amount": 95000.00,
  "quantity": 100
}

Response:
{
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "message": "Transaction created successfully"
  }
}
```

**Implementation Steps:**
1. Validate user has sufficient balance
2. Create transaction record
3. Update portfolio holdings (if type is BUY/SUBSCRIBE)
4. Deduct balance
5. Return transaction details

#### 6. Sell/Redeem Transaction
```typescript
POST /api/v1/transactions/sell

Request:
{
  "holdingId": "uuid",
  "type": "SELL" | "REDEEM",
  "quantity": 50
}

Response:
{
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "message": "Transaction created successfully"
  }
}
```

**Implementation Steps:**
1. Validate user owns the holding
2. Validate sufficient quantity
3. Create transaction record
4. Update portfolio holdings
5. Add balance
6. Return transaction details

### Watchlist

#### 7. Get Watchlist
```typescript
GET /api/v1/client/watchlist

Response:
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "assetId": "uuid",
      "asset": { ... asset details ... },
      "addedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 8. Add to Watchlist
```typescript
POST /api/v1/client/watchlist

Request:
{
  "assetId": "uuid"
}

Response:
{
  "data": {
    "id": "uuid",
    "message": "Asset added to watchlist"
  }
}
```

#### 9. Remove from Watchlist
```typescript
DELETE /api/v1/client/watchlist/:id

Response:
{
  "data": {
    "message": "Asset removed from watchlist"
  }
}
```

### Dashboard

#### 10. Get Dashboard Data
```typescript
GET /api/v1/client/dashboard

Response:
{
  "data": {
    "portfolio": { ...summary... },
    "recentTransactions": [...],
    "topPerformers": [...],
    "recommendations": [...]
  }
}
```

---

## 📊 DATABASE SCHEMA ADDITIONS

### Portfolio Holdings Table
```sql
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  quantity DECIMAL(20, 8) NOT NULL,
  avg_purchase_price DECIMAL(20, 2) NOT NULL,
  total_cost DECIMAL(20, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, asset_id, status)
);

CREATE INDEX idx_portfolio_user ON portfolio_holdings(user_id);
CREATE INDEX idx_portfolio_asset ON portfolio_holdings(asset_id);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  type VARCHAR(20) NOT NULL, -- BUY, SELL, SUBSCRIBE, REDEEM
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 2) NOT NULL,
  total_amount DECIMAL(20, 2) NOT NULL,
  fees DECIMAL(20, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, CANCELLED
  reference_number VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT check_quantity CHECK (quantity > 0),
  CONSTRAINT check_amount CHECK (total_amount > 0)
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_asset ON transactions(asset_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

### Watchlist Table
```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, asset_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
```

---

## 🔧 IMPLEMENTATION GUIDE

### Step 1: Update Existing Endpoints

Ensure your existing endpoints return data in the expected format:

**Example: Products Endpoint**
```typescript
// marketplace-api-node/src/routes/products.routes.ts

router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, productType } = req.query;
    
    let query = db('products').select('*');
    
    if (status) query = query.where('status', status);
    if (productType) query = query.where('product_type', productType);
    
    const products = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('created_at', 'desc');
    
    const total = await db('products').count('* as count').first();
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Step 2: Create New Routes

Create new route files for portfolio and transactions:

```typescript
// marketplace-api-node/src/routes/portfolio.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get portfolio summary
router.get('/portfolio/summary', authenticate, async (req, res) => {
  // Implementation
});

// Get portfolio holdings
router.get('/portfolio/holdings', authenticate, async (req, res) => {
  // Implementation
});

export default router;
```

### Step 3: Add Authentication Middleware

Ensure all client endpoints are protected:

```typescript
// marketplace-api-node/src/middleware/auth.ts
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Step 4: Update Main App

Register new routes:

```typescript
// marketplace-api-node/src/app.ts
import portfolioRoutes from './routes/portfolio.routes';
import transactionRoutes from './routes/transactions.routes';
import watchlistRoutes from './routes/watchlist.routes';

app.use('/api/v1/client', portfolioRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/v1/client', watchlistRoutes);
```

---

## ✅ TESTING CHECKLIST

### Frontend Testing
- [ ] Login with existing user
- [ ] Register new user
- [ ] Navigate all pages
- [ ] Test theme toggle
- [ ] Test responsive design

### API Integration Testing
- [ ] Products list loads
- [ ] Assets list loads
- [ ] Product details show correctly
- [ ] Asset details show correctly
- [ ] Portfolio summary loads
- [ ] Holdings display correctly
- [ ] Transaction history loads
- [ ] Buy modal works
- [ ] Transactions save to database

### Database Testing
- [ ] Portfolio holdings table created
- [ ] Transactions table created
- [ ] Watchlist table created
- [ ] Foreign keys work correctly
- [ ] Indexes created

---

## 🚀 QUICK START

### 1. Run Database Migrations
```bash
cd marketplace-api-node
npm run migrate
```

### 2. Start Backend
```bash
cd marketplace-api-node
npm start
```

### 3. Start Frontend
```bash
cd client-super-app
npm run dev
```

### 4. Test Integration
1. Open http://localhost:5174
2. Login with admin credentials
3. Browse marketplace
4. Check console for API calls

---

## 📝 NOTES

- All monetary values are in PHP (Philippine Peso)
- Prices are stored with 2 decimal places
- Quantities support up to 8 decimal places (for crypto)
- All endpoints should use JWT authentication
- Use correlation IDs for request tracing
- Implement proper error handling
- Add request validation
- Log all transactions

---

**Status**: Ready for Implementation  
**Estimated Time**: 2-3 days  
**Priority**: High  

---

**Created**: October 15, 2025  
**Version**: 1.0.0

