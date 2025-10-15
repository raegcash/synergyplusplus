# API Issues Found & Fixes Needed

## Test Results Summary
- **Total Tests**: 31
- **Passed**: 17 (54.84%)
- **Failed**: 14 (45.16%)

## Critical Issues Found

### 1. Schema Mismatch: admin_users table ❌
**Error**: Column "username" does not exist  
**Root Cause**: PostgreSQL schema uses `email` + `name`, but server.js expects `username`

**PostgreSQL Schema**:
```sql
- email (unique)
- name
- password_hash
```

**Server.js expects**:
```javascript
- username (doesn't exist)
- password_hash
```

**Fix**: Update server.js login queries to use `email` instead of `username`

### 2. Schema Mismatch: customers table ❌
**Error**: Column "customer_code" does not exist  
**Root Cause**: PostgreSQL schema doesn't have `customer_code`

**PostgreSQL Schema**:
```sql
- id (UUID, primary key)
- email (unique)
- phone
- first_name
- last_name
```

**Server.js expects**:
```javascript
- customer_code (doesn't exist)
```

**Fix**: Remove `customer_code` from customer creation/update queries

### 3. Schema Mismatch: assets table ❌
**Error**: Column "symbol" and "asset_code" do not exist  
**Root Cause**: PostgreSQL schema uses `code`, not `symbol` or `asset_code`

**PostgreSQL Schema**:
```sql
- id (UUID)
- code (unique)
- name
- asset_type
```

**Server.js expects**:
```javascript
- symbol (doesn't exist)
- asset_code (doesn't exist)
```

**Fix**: Update server.js to use `code` instead of `symbol` and `asset_code`

### 4. Missing Table: approvals ❌
**Error**: Relation "approvals" does not exist  
**Root Cause**: PostgreSQL migration didn't create approvals table

**Fix**: Need to add approvals table to schema or remove endpoints

### 5. Status Constraint Violation: products ❌
**Error**: Violates check constraint "chk_product_status"  
**Root Cause**: Trying to set invalid status value

**PostgreSQL Constraint**:
```sql
CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED'))
```

**Server.js sends**: Something invalid

**Fix**: Ensure status values match constraint

### 6. Missing Endpoint: GET /products/:id/features ❌
**Error**: 404 - Endpoint doesn't exist  
**Root Cause**: Endpoint not implemented in server.js

**Fix**: Implement the features endpoint

### 7. Schema Mismatch: change_requests ❌
**Error**: Column issues in change_requests  
**Root Cause**: Field name mismatches

**Fix**: Update queries to match PostgreSQL schema

## Detailed Fixes Required

### Fix 1: Update Authentication (server.js lines ~559-600)

**Current Code**:
```javascript
db.get(`SELECT * FROM admin_users WHERE username = ? AND status = 'ACTIVE'`, [username], ...)
```

**Fixed Code**:
```javascript
db.get(`SELECT * FROM admin_users WHERE email = ? AND status = 'ACTIVE'`, [username], ...)
// Note: Keep 'username' variable name but query by 'email' column
```

### Fix 2: Update Customer Creation (server.js lines ~1253+)

**Remove**:
```javascript
customer_code TEXT UNIQUE NOT NULL,
```

**Update Queries**: Remove all references to `customer_code`

### Fix 3: Update Asset Creation (server.js lines ~2173+)

**Change**:
```javascript
symbol TEXT NOT NULL,
asset_code TEXT UNIQUE NOT NULL,
```

**To**:
```javascript
code VARCHAR(100) UNIQUE NOT NULL,
```

### Fix 4: Add Approvals Table to Schema

**Option A**: Create the table:
```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority INTEGER DEFAULT 0,
    current_step VARCHAR(255),
    next_step VARCHAR(255),
    hierarchy_level INTEGER DEFAULT 1,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejected_by VARCHAR(255),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    submitted_by VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Option B**: Remove approval endpoints from server.js

### Fix 5: Implement Missing Endpoints

**Add**:
```javascript
app.get('/api/marketplace/products/:id/features', (req, res) => {
    const { id } = req.params;
    db.all(`SELECT * FROM features WHERE product_id = ?`, [id], (err, features) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(features);
    });
});
```

## Priority Fixes

### HIGH PRIORITY (Breaks authentication)
1. ✅ Fix admin_users username/email mismatch
2. ✅ Fix customers schema mismatch
3. ✅ Fix assets schema mismatch

### MEDIUM PRIORITY (Breaks features)
4. ✅ Add approvals table or remove endpoints
5. ✅ Fix product status constraint
6. ✅ Fix change_requests schema

### LOW PRIORITY (Missing features)
7. ✅ Implement missing features endpoint

## Recommended Action Plan

1. **Create schema migration script** to add missing tables
2. **Update server.js** to match PostgreSQL schema
3. **Re-run tests** to verify fixes
4. **Add integration tests** for new fixes

## Files to Modify

1. `server.js` - Lines affecting:
   - Authentication (~559-650)
   - Customers (~1179-1340)
   - Assets (~2083-2406)
   - Approvals (~2409-2565)
   - Products status (~1563-1592)
   
2. `migrations/002_add_missing_tables.sql` - NEW FILE
   - Add approvals table
   - Add any other missing tables

3. `tests/api-test-suite.js` - Update test data to match schema


