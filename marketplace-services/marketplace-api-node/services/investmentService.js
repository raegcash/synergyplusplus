/**
 * Investment Service - Enterprise Grade
 * Handles all investment-related business logic
 * 
 * @module services/investmentService
 * @version 1.0.0
 * @classification Production-Ready
 */

const crypto = require('crypto');

// =====================================================
// CONSTANTS & CONFIGURATION
// =====================================================

const BUSINESS_RULES = {
  MINIMUM_INVESTMENT: 1000.00,
  MAXIMUM_INVESTMENT_PER_TRANSACTION: 10000000.00,
  DAILY_INVESTMENT_LIMIT: 5000000.00,
  MONTHLY_INVESTMENT_LIMIT: 20000000.00,
  
  // KYC Limits
  NO_KYC_LIMIT: 5000.00,
  BASIC_KYC_LIMIT: 100000.00,
  
  // Fees (percentage)
  TRANSACTION_FEE_PERCENT: 0.005, // 0.5%
  MINIMUM_FEE: 10.00,
};

const INVESTMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
};

const TRANSACTION_TYPE = {
  INVESTMENT: 'INVESTMENT',
  WITHDRAWAL: 'WITHDRAWAL',
  DIVIDEND: 'DIVIDEND',
  FEE: 'FEE',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT'
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Generate unique reference number
 * Format: PREFIX-YYYYMMDD-XXXXXX
 */
function generateReferenceNumber(prefix) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Calculate investment fees
 */
function calculateFees(amount) {
  const fee = amount * BUSINESS_RULES.TRANSACTION_FEE_PERCENT;
  return Math.max(fee, BUSINESS_RULES.MINIMUM_FEE);
}

/**
 * Calculate units purchased
 */
function calculateUnits(amount, unitPrice) {
  if (!unitPrice || unitPrice <= 0) {
    throw new Error('Invalid unit price');
  }
  return parseFloat((amount / unitPrice).toFixed(8));
}

/**
 * Log audit trail
 */
async function logAudit(db, data) {
  const sql = `
    INSERT INTO audit_logs (
      customer_id, action, entity_type, entity_id,
      old_values, new_values, changes, ip_address,
      user_agent, request_id, description, severity, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await db.run(sql, [
    data.customerId || null,
    data.action,
    data.entityType,
    data.entityId || null,
    data.oldValues ? JSON.stringify(data.oldValues) : null,
    data.newValues ? JSON.stringify(data.newValues) : null,
    data.changes ? JSON.stringify(data.changes) : null,
    data.ipAddress || null,
    data.userAgent || null,
    data.requestId || null,
    data.description || '',
    data.severity || 'INFO',
    data.metadata ? JSON.stringify(data.metadata) : null
  ]);
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Validate investment request
 */
async function validateInvestmentRequest(db, customerId, assetId, amount, paymentMethod) {
  const errors = [];
  
  // 1. Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push({ field: 'amount', message: 'Invalid investment amount' });
  }
  
  if (amount < BUSINESS_RULES.MINIMUM_INVESTMENT) {
    errors.push({
      field: 'amount',
      message: `Minimum investment is ${BUSINESS_RULES.MINIMUM_INVESTMENT.toFixed(2)} PHP`
    });
  }
  
  if (amount > BUSINESS_RULES.MAXIMUM_INVESTMENT_PER_TRANSACTION) {
    errors.push({
      field: 'amount',
      message: `Maximum investment per transaction is ${BUSINESS_RULES.MAXIMUM_INVESTMENT_PER_TRANSACTION.toFixed(2)} PHP`
    });
  }
  
  // 2. Validate customer
  const customer = await db.get(
    'SELECT * FROM customers WHERE id = ? AND status = ?',
    [customerId, 'ACTIVE']
  );
  
  if (!customer) {
    errors.push({ field: 'customer', message: 'Customer not found or inactive' });
    return { valid: false, errors };
  }
  
  // 3. Validate asset
  const asset = await db.get(
    'SELECT * FROM assets WHERE id = ?',
    [assetId]
  );
  
  if (!asset) {
    errors.push({ field: 'assetId', message: 'Asset not found' });
    return { valid: false, errors };
  }
  
  if (asset.status !== 'ACTIVE') {
    errors.push({ field: 'assetId', message: 'Asset is not available for investment' });
  }
  
  if (!asset.price || asset.price <= 0) {
    errors.push({ field: 'assetId', message: 'Asset price not available' });
  }
  
  // 4. Validate payment method
  const validPaymentMethods = ['BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'EWALLET', 'GCASH', 'PAYMAYA', 'BANK_ACCOUNT'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' });
  }
  
  // 5. Check KYC limits
  const kycStatus = customer.kyc_status || 'PENDING';
  if (kycStatus === 'PENDING' && amount > BUSINESS_RULES.NO_KYC_LIMIT) {
    errors.push({
      field: 'amount',
      message: `KYC verification required for investments above ${BUSINESS_RULES.NO_KYC_LIMIT.toFixed(2)} PHP`
    });
  }
  
  if (kycStatus === 'VERIFIED' && amount > BUSINESS_RULES.BASIC_KYC_LIMIT) {
    // This is allowed, full KYC
  }
  
  // 6. Check daily limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyTotal = await db.get(`
    SELECT COALESCE(SUM(investment_amount), 0) as total
    FROM investments
    WHERE customer_id = ?
      AND DATE(investment_date) = CURRENT_DATE
      AND status NOT IN ('FAILED', 'CANCELLED', 'REFUNDED')
      AND deleted_at IS NULL
  `, [customerId]);
  
  if (dailyTotal && (dailyTotal.total + amount) > BUSINESS_RULES.DAILY_INVESTMENT_LIMIT) {
    errors.push({
      field: 'amount',
      message: `Daily investment limit exceeded. Limit: ${BUSINESS_RULES.DAILY_INVESTMENT_LIMIT.toFixed(2)} PHP`
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    customer,
    asset
  };
}

// =====================================================
// INVESTMENT SERVICE FUNCTIONS
// =====================================================

/**
 * Create Investment
 * Main function to create a new investment with full transaction support
 */
async function createInvestment(db, data) {
  const {
    customerId,
    assetId,
    productId = null,
    amount,
    paymentMethod,
    ipAddress = null,
    userAgent = null,
    requestId = null
  } = data;
  
  // 1. Validate request
  const validation = await validateInvestmentRequest(db, customerId, assetId, amount, paymentMethod);
  if (!validation.valid) {
    throw {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: validation.errors,
      statusCode: 400
    };
  }
  
  const { customer, asset } = validation;
  
  // 2. Calculate investment details
  const fees = calculateFees(amount);
  const totalAmount = amount + fees;
  const unitPrice = asset.price;
  const units = calculateUnits(amount, unitPrice);
  
  // 3. Generate reference numbers
  const investmentRef = generateReferenceNumber('INV');
  const paymentRef = generateReferenceNumber('PAY');
  const transactionRef = generateReferenceNumber('TXN');
  
  let investmentId, paymentId, transactionId;
  
  try {
    // 4. Start transaction
    await db.run('BEGIN TRANSACTION');
    
    // 5. Create investment record
    const investmentResult = await db.run(`
      INSERT INTO investments (
        customer_id, asset_id, product_id,
        investment_amount, units_purchased, unit_price,
        investment_type, status, investment_date,
        fees, total_amount, payment_method, payment_reference,
        risk_level, kyc_verified, aml_checked,
        created_by, updated_by
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?,
        'ONE_TIME', 'PENDING', CURRENT_TIMESTAMP,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )
      RETURNING id
    `, [
      customerId, assetId, productId,
      amount, units, unitPrice,
      fees, totalAmount, paymentMethod, paymentRef,
      asset.risk_level || 'MEDIUM', customer.kyc_status === 'VERIFIED', false,
      customer.email, customer.email
    ]);
    
    investmentId = investmentResult.lastID;
    
    // 6. Create payment record
    const paymentResult = await db.run(`
      INSERT INTO payments (
        customer_id, investment_id,
        amount, currency, payment_method, status,
        reference_number, initiated_at
      ) VALUES (
        ?, ?,
        ?, 'PHP', ?, 'PENDING',
        ?, CURRENT_TIMESTAMP
      )
      RETURNING id
    `, [
      customerId, investmentId,
      totalAmount, paymentMethod,
      paymentRef
    ]);
    
    paymentId = paymentResult.lastID;
    
    // 7. Create transaction record
    const transactionResult = await db.run(`
      INSERT INTO transactions (
        customer_id, investment_id, asset_id,
        transaction_type, amount, units, unit_price,
        status, description, reference_number,
        transaction_date, metadata
      ) VALUES (
        ?, ?, ?,
        'INVESTMENT', ?, ?, ?,
        'PENDING', ?, ?,
        CURRENT_TIMESTAMP, ?
      )
      RETURNING id
    `, [
      customerId, investmentId, assetId,
      amount, units, unitPrice,
      `Investment in ${asset.name}`,
      transactionRef,
      JSON.stringify({ fees, totalAmount, paymentMethod })
    ]);
    
    transactionId = transactionResult.lastID;
    
    // 8. Update/Create portfolio holding
    const existingHolding = await db.get(
      'SELECT * FROM portfolio_holdings WHERE customer_id = ? AND asset_id = ?',
      [customerId, assetId]
    );
    
    if (existingHolding) {
      // Update existing holding
      const newTotalUnits = parseFloat(existingHolding.total_units) + units;
      const newTotalInvested = parseFloat(existingHolding.total_invested) + amount;
      const newAveragePrice = newTotalInvested / newTotalUnits;
      
      await db.run(`
        UPDATE portfolio_holdings
        SET total_units = ?,
            total_invested = ?,
            average_price = ?,
            last_investment_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = ? AND asset_id = ?
      `, [newTotalUnits, newTotalInvested, newAveragePrice, customerId, assetId]);
    } else {
      // Create new holding
      await db.run(`
        INSERT INTO portfolio_holdings (
          customer_id, asset_id,
          total_units, total_invested, average_price,
          current_price, first_investment_date, last_investment_date
        ) VALUES (
          ?, ?,
          ?, ?, ?,
          ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [customerId, assetId, units, amount, unitPrice, unitPrice]);
    }
    
    // 9. Log audit trail
    await logAudit(db, {
      customerId,
      action: 'CREATE_INVESTMENT',
      entityType: 'investment',
      entityId: investmentId,
      newValues: {
        investmentId,
        amount,
        units,
        assetId,
        status: 'PENDING'
      },
      ipAddress,
      userAgent,
      requestId,
      description: `Customer ${customer.email} created investment of ${amount} PHP in ${asset.name}`,
      severity: 'INFO',
      metadata: { paymentMethod, fees, totalAmount }
    });
    
    // 10. Commit transaction
    await db.run('COMMIT');
    
    // 11. Return success response
    return {
      success: true,
      data: {
        investmentId,
        referenceNumber: investmentRef,
        amount,
        fees,
        totalAmount,
        units,
        unitPrice,
        asset: {
          id: asset.id,
          name: asset.name,
          code: asset.code,
          type: asset.asset_type
        },
        payment: {
          id: paymentId,
          referenceNumber: paymentRef,
          method: paymentMethod,
          status: 'PENDING'
        },
        transaction: {
          id: transactionId,
          referenceNumber: transactionRef
        },
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    // Rollback on error
    await db.run('ROLLBACK');
    
    // Log error
    await logAudit(db, {
      customerId,
      action: 'CREATE_INVESTMENT_FAILED',
      entityType: 'investment',
      description: `Failed to create investment: ${error.message}`,
      severity: 'ERROR',
      metadata: { error: error.message, amount, assetId }
    });
    
    throw error;
  }
}

/**
 * Get investment by ID
 */
async function getInvestmentById(db, investmentId, customerId = null) {
  let sql = `
    SELECT 
      i.*,
      a.name as asset_name,
      a.code as asset_code,
      a.asset_type,
      a.current_price as asset_current_price,
      p.name as product_name,
      c.email as customer_email,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name
    FROM investments i
    LEFT JOIN assets a ON i.asset_id = a.id
    LEFT JOIN products p ON i.product_id = p.id
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
      AND i.deleted_at IS NULL
  `;
  
  const params = [investmentId];
  
  if (customerId) {
    sql += ' AND i.customer_id = ?';
    params.push(customerId);
  }
  
  const investment = await db.get(sql, params);
  
  if (!investment) {
    throw {
      code: 'NOT_FOUND',
      message: 'Investment not found',
      statusCode: 404
    };
  }
  
  return investment;
}

/**
 * Get customer investments
 */
async function getCustomerInvestments(db, customerId, options = {}) {
  const {
    status = null,
    assetId = null,
    limit = 50,
    offset = 0,
    sortBy = 'investment_date',
    sortOrder = 'DESC'
  } = options;
  
  let sql = `
    SELECT 
      i.*,
      a.name as asset_name,
      a.code as asset_code,
      a.asset_type,
      p.name as product_name
    FROM investments i
    LEFT JOIN assets a ON i.asset_id = a.id
    LEFT JOIN products p ON i.product_id = p.id
    WHERE i.customer_id = ?
      AND i.deleted_at IS NULL
  `;
  
  const params = [customerId];
  
  if (status) {
    sql += ' AND i.status = ?';
    params.push(status);
  }
  
  if (assetId) {
    sql += ' AND i.asset_id = ?';
    params.push(assetId);
  }
  
  sql += ` ORDER BY i.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const investments = await db.all(sql, params);
  
  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM investments WHERE customer_id = ? AND deleted_at IS NULL';
  const countParams = [customerId];
  
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  
  if (assetId) {
    countSql += ' AND asset_id = ?';
    countParams.push(assetId);
  }
  
  const { total } = await db.get(countSql, countParams);
  
  return {
    investments,
    pagination: {
      total,
      limit,
      offset,
      hasMore: (offset + limit) < total
    }
  };
}

/**
 * Cancel investment
 */
async function cancelInvestment(db, investmentId, customerId, reason = '') {
  // Get investment
  const investment = await getInvestmentById(db, investmentId, customerId);
  
  // Check if cancellable
  if (!['PENDING', 'PROCESSING'].includes(investment.status)) {
    throw {
      code: 'INVALID_STATUS',
      message: 'Investment cannot be cancelled',
      statusCode: 422
    };
  }
  
  try {
    await db.run('BEGIN TRANSACTION');
    
    // Update investment status
    await db.run(`
      UPDATE investments
      SET status = 'CANCELLED',
          cancelled_at = CURRENT_TIMESTAMP,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reason || 'Cancelled by customer', investmentId]);
    
    // Update payment status
    await db.run(`
      UPDATE payments
      SET status = 'CANCELLED',
          updated_at = CURRENT_TIMESTAMP
      WHERE investment_id = ?
    `, [investmentId]);
    
    // Update transaction status
    await db.run(`
      UPDATE transactions
      SET status = 'REVERSED',
          updated_at = CURRENT_TIMESTAMP
      WHERE investment_id = ?
    `, [investmentId]);
    
    // Reverse portfolio holding if it was just created
    if (investment.status === 'PENDING') {
      const holding = await db.get(
        'SELECT * FROM portfolio_holdings WHERE customer_id = ? AND asset_id = ?',
        [customerId, investment.asset_id]
      );
      
      if (holding) {
        const newTotalUnits = parseFloat(holding.total_units) - parseFloat(investment.units_purchased);
        const newTotalInvested = parseFloat(holding.total_invested) - parseFloat(investment.investment_amount);
        
        if (newTotalUnits <= 0) {
          // Delete holding if no units left
          await db.run(
            'DELETE FROM portfolio_holdings WHERE customer_id = ? AND asset_id = ?',
            [customerId, investment.asset_id]
          );
        } else {
          // Update holding
          const newAveragePrice = newTotalInvested / newTotalUnits;
          await db.run(`
            UPDATE portfolio_holdings
            SET total_units = ?,
                total_invested = ?,
                average_price = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = ? AND asset_id = ?
          `, [newTotalUnits, newTotalInvested, newAveragePrice, customerId, investment.asset_id]);
        }
      }
    }
    
    // Log audit
    await logAudit(db, {
      customerId,
      action: 'CANCEL_INVESTMENT',
      entityType: 'investment',
      entityId: investmentId,
      oldValues: { status: investment.status },
      newValues: { status: 'CANCELLED' },
      description: `Investment cancelled: ${reason}`,
      severity: 'INFO'
    });
    
    await db.run('COMMIT');
    
    return {
      success: true,
      message: 'Investment cancelled successfully'
    };
    
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createInvestment,
  getInvestmentById,
  getCustomerInvestments,
  cancelInvestment,
  validateInvestmentRequest,
  // Export for testing
  calculateFees,
  calculateUnits,
  generateReferenceNumber,
  BUSINESS_RULES,
  INVESTMENT_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_TYPE
};

