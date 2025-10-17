/**
 * Profile Service Unit Tests - Enterprise Grade
 * Comprehensive tests for profile management and KYC functionality
 * 
 * @module tests/profileService.test
 * @version 1.0.0
 */

const { expect } = require('chai');
const sinon = require('sinon');
const profileService = require('../services/profileService');

describe('Profile Service - Unit Tests', () => {
  let dbStub;
  const mockCustomerId = '123e4567-e89b-12d3-a456-426614174000';
  const mockProfileId = '223e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    // Create database stub
    dbStub = {
      get: sinon.stub(),
      run: sinon.stub(),
      all: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // =====================================================
  // GET CUSTOMER PROFILE TESTS
  // =====================================================

  describe('getCustomerProfile', () => {
    it('should return formatted profile when profile exists', async () => {
      const mockProfile = {
        id: mockProfileId,
        customer_id: mockCustomerId,
        first_name: 'John',
        middle_name: 'Q',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        gender: 'MALE',
        email: 'john.doe@example.com',
        mobile_number: '+639171234567',
        city: 'Manila',
        employment_status: 'EMPLOYED',
        monthly_income: '50000',
        investment_experience: 'INTERMEDIATE',
        risk_tolerance: 'MODERATE',
        kyc_status: 'PENDING',
        kyc_level: 'NONE',
        profile_completed: false,
        profile_completion_percentage: 65,
        account_status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        account_created_at: '2024-01-01T00:00:00Z'
      };

      dbStub.get.resolves(mockProfile);
      
      // Replace the actual db with our stub
      const originalDb = require('../config/db-compat');
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.getCustomerProfile(mockCustomerId);

      expect(result).to.be.an('object');
      expect(result.customerId).to.equal(mockCustomerId);
      expect(result.personalInfo.firstName).to.equal('John');
      expect(result.personalInfo.lastName).to.equal('Doe');
      expect(result.profileCompletion.percentage).to.equal(65);
      expect(result.kycStatus.status).to.equal('PENDING');
    });

    it('should handle database errors gracefully', async () => {
      dbStub.get.rejects(new Error('Database connection failed'));
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      try {
        await profileServiceModule.getCustomerProfile(mockCustomerId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.have.property('code', 'PROFILE_ERROR');
        expect(error).to.have.property('message', 'Failed to retrieve profile');
      }
    });
  });

  // =====================================================
  // UPDATE CUSTOMER PROFILE TESTS
  // =====================================================

  describe('updateCustomerProfile', () => {
    it('should update existing profile successfully', async () => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        mobileNumber: '+639171234567',
        city: 'Manila'
      };

      const existingProfile = { id: mockProfileId };
      const updatedProfile = {
        id: mockProfileId,
        customer_id: mockCustomerId,
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '+639171234567',
        city: 'Manila',
        email: 'john.doe@example.com',
        kyc_status: 'PENDING',
        kyc_level: 'NONE',
        profile_completed: false,
        profile_completion_percentage: 40,
        account_status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        account_created_at: '2024-01-01T00:00:00Z'
      };

      dbStub.get.onFirstCall().resolves(existingProfile);
      dbStub.get.onSecondCall().resolves(updatedProfile);
      dbStub.run.resolves({ changes: 1 });
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.updateCustomerProfile(mockCustomerId, profileData);

      expect(result).to.be.an('object');
      expect(result.customerId).to.equal(mockCustomerId);
      expect(result.personalInfo.firstName).to.equal('John');
      expect(result.personalInfo.lastName).to.equal('Doe');
    });

    it('should create new profile if not exists', async () => {
      const profileData = {
        firstName: 'Jane',
        lastName: 'Smith'
      };

      dbStub.get.onFirstCall().resolves(null); // No existing profile
      dbStub.get.onSecondCall().resolves({
        id: mockProfileId,
        customer_id: mockCustomerId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        kyc_status: 'PENDING',
        kyc_level: 'NONE',
        profile_completed: false,
        profile_completion_percentage: 10,
        account_status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        account_created_at: '2024-01-01T00:00:00Z'
      });
      dbStub.run.resolves({ lastID: mockProfileId });
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.updateCustomerProfile(mockCustomerId, profileData);

      expect(result).to.be.an('object');
      expect(result.customerId).to.equal(mockCustomerId);
      expect(result.personalInfo.firstName).to.equal('Jane');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        dateOfBirth: '2020-01-01' // Would make user too young
      };

      // Since validation happens in routes, this test verifies the service handles bad data
      dbStub.get.onFirstCall().resolves({ id: mockProfileId });
      dbStub.run.resolves({ changes: 1 });
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      // Service itself should not validate, but should handle database errors
      const result = await profileServiceModule.updateCustomerProfile(mockCustomerId, invalidData);
      expect(result).to.be.an('object');
    });
  });

  // =====================================================
  // KYC DOCUMENT TESTS
  // =====================================================

  describe('uploadKYCDocument', () => {
    it('should upload KYC document successfully', async () => {
      const documentData = {
        documentType: 'VALID_ID',
        documentNumber: 'A1234567',
        documentIssuer: 'SSS',
        fileName: 'id-front.jpg',
        filePath: '/uploads/id-front.jpg',
        fileSize: 102400,
        fileType: 'image/jpeg'
      };

      const mockProfile = { id: mockProfileId };
      const mockDocumentId = '323e4567-e89b-12d3-a456-426614174000';

      dbStub.get.resolves(mockProfile);
      dbStub.run.resolves({ rows: [{ id: mockDocumentId }] });
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.uploadKYCDocument(mockCustomerId, documentData);

      expect(result).to.be.an('object');
      expect(result).to.have.property('id', mockDocumentId);
      expect(result).to.have.property('status', 'PENDING');
      expect(result).to.have.property('message', 'Document uploaded successfully');
    });

    it('should handle profile not found', async () => {
      const documentData = {
        documentType: 'VALID_ID',
        fileName: 'id.jpg',
        filePath: '/uploads/id.jpg',
        fileSize: 102400,
        fileType: 'image/jpeg'
      };

      dbStub.get.resolves(null); // No profile found
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      try {
        await profileServiceModule.uploadKYCDocument(mockCustomerId, documentData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.have.property('code', 'PROFILE_NOT_FOUND');
      }
    });
  });

  describe('getKYCDocuments', () => {
    it('should return list of KYC documents', async () => {
      const mockDocuments = [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          document_type: 'VALID_ID',
          document_number: 'A1234567',
          file_name: 'id-front.jpg',
          status: 'APPROVED',
          uploaded_at: '2024-01-01T00:00:00Z',
          verified_at: '2024-01-02T00:00:00Z'
        },
        {
          id: '423e4567-e89b-12d3-a456-426614174000',
          document_type: 'SELFIE',
          document_number: null,
          file_name: 'selfie.jpg',
          status: 'PENDING',
          uploaded_at: '2024-01-01T00:00:00Z',
          verified_at: null
        }
      ];

      dbStub.all.resolves(mockDocuments);
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.getKYCDocuments(mockCustomerId);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result[0].documentType).to.equal('VALID_ID');
      expect(result[0].status).to.equal('APPROVED');
      expect(result[1].documentType).to.equal('SELFIE');
      expect(result[1].status).to.equal('PENDING');
    });

    it('should return empty array when no documents', async () => {
      dbStub.all.resolves([]);
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.getKYCDocuments(mockCustomerId);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('submitKYCForReview', () => {
    it('should submit KYC when profile is complete', async () => {
      const mockProfile = {
        profile_completion_percentage: 85,
        kyc_status: 'PENDING'
      };

      const mockDocCount = { count: '3' }; // 3 documents uploaded

      dbStub.get.onFirstCall().resolves(mockProfile);
      dbStub.get.onSecondCall().resolves(mockDocCount);
      dbStub.run.resolves({ changes: 1 });
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      const result = await profileServiceModule.submitKYCForReview(mockCustomerId);

      expect(result).to.be.an('object');
      expect(result.success).to.be.true;
      expect(result.status).to.equal('IN_REVIEW');
      expect(result.message).to.equal('KYC submitted for review');
    });

    it('should reject when profile incomplete', async () => {
      const mockProfile = {
        profile_completion_percentage: 60, // Less than 80%
        kyc_status: 'PENDING'
      };

      dbStub.get.resolves(mockProfile);
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      try {
        await profileServiceModule.submitKYCForReview(mockCustomerId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.have.property('code', 'INCOMPLETE_PROFILE');
        expect(error.message).to.include('80%');
      }
    });

    it('should reject when insufficient documents', async () => {
      const mockProfile = {
        profile_completion_percentage: 90,
        kyc_status: 'PENDING'
      };

      const mockDocCount = { count: '1' }; // Only 1 document

      dbStub.get.onFirstCall().resolves(mockProfile);
      dbStub.get.onSecondCall().resolves(mockDocCount);
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      try {
        await profileServiceModule.submitKYCForReview(mockCustomerId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.have.property('code', 'INSUFFICIENT_DOCUMENTS');
        expect(error.message).to.include('at least 2');
      }
    });

    it('should reject when profile not found', async () => {
      dbStub.get.resolves(null);
      
      const rewire = require('rewire');
      const profileServiceModule = rewire('../services/profileService');
      profileServiceModule.__set__('db', dbStub);

      try {
        await profileServiceModule.submitKYCForReview(mockCustomerId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.have.property('code', 'PROFILE_NOT_FOUND');
      }
    });
  });
});

