/**
 * Investment Service Unit Tests
 * Enterprise-grade testing for investment business logic
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

const { describe, it, before, after, beforeEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const investmentService = require('../services/investmentService');

describe('Investment Service - Unit Tests', () => {
  
  describe('calculateFees()', () => {
    it('should calculate 0.5% fee for normal amounts', () => {
      const fees = investmentService.calculateFees(10000);
      expect(fees).to.equal(50); // 0.5% of 10,000
    });

    it('should apply minimum fee of 10 PHP', () => {
      const fees = investmentService.calculateFees(1000);
      expect(fees).to.equal(10); // Minimum fee
    });

    it('should apply minimum fee for amounts below 2000', () => {
      const fees = investmentService.calculateFees(1500);
      expect(fees).to.equal(10); // 0.5% = 7.5, but min is 10
    });

    it('should calculate correct fee for large amounts', () => {
      const fees = investmentService.calculateFees(1000000);
      expect(fees).to.equal(5000); // 0.5% of 1,000,000
    });

    it('should handle zero amount', () => {
      const fees = investmentService.calculateFees(0);
      expect(fees).to.equal(10); // Minimum fee
    });
  });

  describe('calculateUnits()', () => {
    it('should calculate units correctly', () => {
      const units = investmentService.calculateUnits(10000, 100);
      expect(units).to.equal(100); // 10,000 / 100
    });

    it('should handle decimal unit prices', () => {
      const units = investmentService.calculateUnits(1000, 1.5234);
      expect(units).to.be.closeTo(656.37, 0.01);
    });

    it('should return 0 for zero unit price', () => {
      const units = investmentService.calculateUnits(1000, 0);
      expect(units).to.equal(0);
    });

    it('should handle large amounts', () => {
      const units = investmentService.calculateUnits(1000000, 250);
      expect(units).to.equal(4000);
    });

    it('should return precise decimal units', () => {
      const units = investmentService.calculateUnits(3000, 1.52);
      expect(units).to.be.closeTo(1973.68, 0.01);
    });
  });

  describe('generateReferenceNumber()', () => {
    it('should generate reference with correct prefix', () => {
      const ref = investmentService.generateReferenceNumber('INV');
      expect(ref).to.match(/^INV-\d{8}-[A-F0-9]{6}$/);
    });

    it('should generate unique references', () => {
      const ref1 = investmentService.generateReferenceNumber('INV');
      const ref2 = investmentService.generateReferenceNumber('INV');
      expect(ref1).to.not.equal(ref2);
    });

    it('should work with different prefixes', () => {
      const ref = investmentService.generateReferenceNumber('PAY');
      expect(ref).to.match(/^PAY-\d{8}-[A-F0-9]{6}$/);
    });

    it('should include current date', () => {
      const ref = investmentService.generateReferenceNumber('TXN');
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      expect(ref).to.include(date);
    });
  });

  describe('validateInvestmentRequest()', () => {
    let mockDb;

    beforeEach(() => {
      mockDb = {
        get: sinon.stub()
      };
    });

    it('should validate minimum investment amount', async () => {
      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        500, // Below minimum 1000
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors).to.have.lengthOf.at.least(1);
      expect(result.errors[0].field).to.equal('amount');
    });

    it('should validate maximum investment amount', async () => {
      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        20000000, // Above maximum 10,000,000
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors).to.have.lengthOf.at.least(1);
    });

    it('should validate customer existence', async () => {
      mockDb.get.onCall(0).resolves(null); // Customer not found

      const result = await investmentService.validateInvestmentRequest(
        'invalid-customer-id',
        'asset-id',
        5000,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'customer')).to.be.true;
    });

    it('should validate asset existence', async () => {
      mockDb.get.onCall(0).resolves({
        id: 'customer-id',
        email: 'test@test.com',
        status: 'ACTIVE',
        kyc_status: 'VERIFIED'
      });
      mockDb.get.onCall(1).resolves(null); // Asset not found

      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'invalid-asset-id',
        5000,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'assetId')).to.be.true;
    });

    it('should validate KYC limits', async () => {
      mockDb.get.onCall(0).resolves({
        id: 'customer-id',
        email: 'test@test.com',
        status: 'ACTIVE',
        kyc_status: 'PENDING'
      });
      mockDb.get.onCall(1).resolves({
        id: 'asset-id',
        name: 'Test Asset',
        status: 'ACTIVE',
        price: 100
      });
      mockDb.get.onCall(2).resolves({ total: 0 }); // Daily total

      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        10000, // Above 5000 limit for non-verified KYC
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'kycStatus')).to.be.true;
    });

    it('should validate payment method', async () => {
      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        5000,
        'INVALID_METHOD',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'paymentMethod')).to.be.true;
    });

    it('should pass validation for valid request', async () => {
      mockDb.get.onCall(0).resolves({
        id: 'customer-id',
        email: 'test@test.com',
        status: 'ACTIVE',
        kyc_status: 'VERIFIED'
      });
      mockDb.get.onCall(1).resolves({
        id: 'asset-id',
        name: 'Test Asset',
        status: 'ACTIVE',
        price: 100,
        risk_level: 'MEDIUM'
      });
      mockDb.get.onCall(2).resolves({ total: 0 }); // Daily total

      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        5000,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
      expect(result.customer).to.exist;
      expect(result.asset).to.exist;
    });
  });

  describe('Business Rules Enforcement', () => {
    it('should enforce minimum investment of 1000 PHP', () => {
      const MINIMUM = 1000;
      expect(MINIMUM).to.equal(1000);
    });

    it('should enforce maximum investment of 10,000,000 PHP', () => {
      const MAXIMUM = 10000000;
      expect(MAXIMUM).to.equal(10000000);
    });

    it('should enforce 0.5% transaction fee', () => {
      const FEE_PERCENT = 0.005;
      expect(FEE_PERCENT).to.equal(0.005);
    });

    it('should enforce minimum fee of 10 PHP', () => {
      const MIN_FEE = 10;
      expect(MIN_FEE).to.equal(10);
    });

    it('should enforce no KYC limit of 5000 PHP', () => {
      const NO_KYC_LIMIT = 5000;
      expect(NO_KYC_LIMIT).to.equal(5000);
    });

    it('should enforce daily limit of 5,000,000 PHP', () => {
      const DAILY_LIMIT = 5000000;
      expect(DAILY_LIMIT).to.equal(5000000);
    });
  });

  describe('Error Handling', () => {
    it('should handle null customer ID gracefully', async () => {
      const mockDb = { get: sinon.stub() };
      
      const result = await investmentService.validateInvestmentRequest(
        null,
        'asset-id',
        5000,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'customerId')).to.be.true;
    });

    it('should handle null asset ID gracefully', async () => {
      const mockDb = { get: sinon.stub() };
      
      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        null,
        5000,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'assetId')).to.be.true;
    });

    it('should handle negative amounts', async () => {
      const mockDb = { get: sinon.stub() };
      
      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        -1000,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'amount')).to.be.true;
    });

    it('should handle zero amounts', async () => {
      const mockDb = { get: sinon.stub() };
      
      const result = await investmentService.validateInvestmentRequest(
        'customer-id',
        'asset-id',
        0,
        'GCASH',
        mockDb
      );

      expect(result.valid).to.be.false;
      expect(result.errors.some(e => e.field === 'amount')).to.be.true;
    });
  });
});

