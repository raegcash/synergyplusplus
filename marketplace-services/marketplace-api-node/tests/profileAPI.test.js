/**
 * Profile API Integration Tests - Enterprise Grade
 * Tests for Profile and KYC API endpoints
 * 
 * @module tests/profileAPI.test
 * @version 1.0.0
 */

const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');

// Create a mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com'
  };
  next();
};

describe('Profile API - Integration Tests', () => {
  let profileRoutes;
  let profileServiceStub;

  before(() => {
    // Load routes module with rewire for stubbing
    profileRoutes = rewire('../routes/profile');
    
    // Replace auth middleware with mock
    profileRoutes.__set__('authMiddleware', { protect: mockAuth });
    
    // Mount routes
    app.use('/api/v1/profile', profileRoutes);
  });

  beforeEach(() => {
    // Create service stubs
    profileServiceStub = {
      getCustomerProfile: sinon.stub(),
      updateCustomerProfile: sinon.stub(),
      uploadKYCDocument: sinon.stub(),
      getKYCDocuments: sinon.stub(),
      submitKYCForReview: sinon.stub()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // =====================================================
  // GET PROFILE TESTS
  // =====================================================

  describe('GET /api/v1/profile', () => {
    it('should return customer profile', (done) => {
      const mockProfile = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe'
        },
        contactInfo: {
          email: 'john.doe@example.com',
          mobileNumber: '+639171234567',
          emailVerified: true,
          phoneVerified: false
        },
        profileCompletion: {
          completed: false,
          percentage: 65
        },
        kycStatus: {
          level: 'NONE',
          status: 'PENDING'
        }
      };

      profileServiceStub.getCustomerProfile.resolves(mockProfile);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .get('/api/v1/profile')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('customerId');
          expect(res.body.data.personalInfo).to.have.property('firstName', 'John');
          expect(res.body.data.profileCompletion.percentage).to.equal(65);
          
          done();
        });
    });

    it('should handle profile not found', (done) => {
      profileServiceStub.getCustomerProfile.rejects({
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found'
      });
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .get('/api/v1/profile')
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error');
          expect(res.body.error.code).to.equal('PROFILE_NOT_FOUND');
          
          done();
        });
    });
  });

  // =====================================================
  // UPDATE PROFILE TESTS
  // =====================================================

  describe('PUT /api/v1/profile', () => {
    it('should update profile successfully', (done) => {
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        mobileNumber: '+639171234567',
        city: 'Manila'
      };

      const updatedProfile = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        customerId: '123e4567-e89b-12d3-a456-426614174000',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe'
        },
        contactInfo: {
          mobileNumber: '+639171234567'
        },
        addressInfo: {
          city: 'Manila'
        },
        profileCompletion: {
          completed: false,
          percentage: 70
        }
      };

      profileServiceStub.updateCustomerProfile.resolves(updatedProfile);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .put('/api/v1/profile')
        .send(updateData)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Profile updated successfully');
          expect(res.body.data.personalInfo.firstName).to.equal('John');
          expect(res.body.data.profileCompletion.percentage).to.equal(70);
          
          done();
        });
    });

    it('should validate profile data', (done) => {
      const invalidData = {
        dateOfBirth: '2020-01-01' // Too young
      };

      request(app)
        .put('/api/v1/profile')
        .send(invalidData)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.code).to.equal('VALIDATION_ERROR');
          
          done();
        });
    });
  });

  // =====================================================
  // GET COMPLETION TESTS
  // =====================================================

  describe('GET /api/v1/profile/completion', () => {
    it('should return profile completion status', (done) => {
      const mockProfile = {
        profileCompletion: {
          completed: false,
          percentage: 75
        },
        personalInfo: {},
        contactInfo: {},
        addressInfo: {},
        employmentInfo: {},
        financialInfo: {},
        investmentProfile: {}
      };

      profileServiceStub.getCustomerProfile.resolves(mockProfile);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .get('/api/v1/profile/completion')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('completed', false);
          expect(res.body.data).to.have.property('percentage', 75);
          expect(res.body.data).to.have.property('missingFields');
          
          done();
        });
    });
  });

  // =====================================================
  // KYC DOCUMENT TESTS
  // =====================================================

  describe('POST /api/v1/profile/kyc/documents', () => {
    it('should upload KYC document successfully', (done) => {
      const documentData = {
        documentType: 'VALID_ID',
        documentNumber: 'A1234567',
        fileName: 'id-front.jpg',
        filePath: '/uploads/id-front.jpg',
        fileSize: 102400,
        fileType: 'image/jpeg'
      };

      const uploadResult = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        message: 'Document uploaded successfully',
        status: 'PENDING'
      };

      profileServiceStub.uploadKYCDocument.resolves(uploadResult);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .post('/api/v1/profile/kyc/documents')
        .send(documentData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Document uploaded successfully');
          expect(res.body.data).to.have.property('status', 'PENDING');
          
          done();
        });
    });

    it('should validate document data', (done) => {
      const invalidData = {
        // Missing required fields
        documentType: 'INVALID_TYPE'
      };

      request(app)
        .post('/api/v1/profile/kyc/documents')
        .send(invalidData)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.code).to.equal('VALIDATION_ERROR');
          
          done();
        });
    });
  });

  describe('GET /api/v1/profile/kyc/documents', () => {
    it('should return list of KYC documents', (done) => {
      const mockDocuments = [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          documentType: 'VALID_ID',
          fileName: 'id-front.jpg',
          status: 'APPROVED',
          uploadedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '423e4567-e89b-12d3-a456-426614174000',
          documentType: 'SELFIE',
          fileName: 'selfie.jpg',
          status: 'PENDING',
          uploadedAt: '2024-01-01T00:00:00Z'
        }
      ];

      profileServiceStub.getKYCDocuments.resolves(mockDocuments);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .get('/api/v1/profile/kyc/documents')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('count', 2);
          expect(res.body.data).to.be.an('array').with.lengthOf(2);
          expect(res.body.data[0].documentType).to.equal('VALID_ID');
          
          done();
        });
    });
  });

  describe('POST /api/v1/profile/kyc/submit', () => {
    it('should submit KYC for review successfully', (done) => {
      const submitResult = {
        success: true,
        message: 'KYC submitted for review',
        status: 'IN_REVIEW'
      };

      profileServiceStub.submitKYCForReview.resolves(submitResult);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .post('/api/v1/profile/kyc/submit')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'KYC submitted for review');
          expect(res.body.data.status).to.equal('IN_REVIEW');
          
          done();
        });
    });

    it('should reject when profile incomplete', (done) => {
      profileServiceStub.submitKYCForReview.rejects({
        code: 'INCOMPLETE_PROFILE',
        message: 'Profile must be at least 80% complete'
      });
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .post('/api/v1/profile/kyc/submit')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.code).to.equal('INCOMPLETE_PROFILE');
          expect(res.body.error.message).to.include('80%');
          
          done();
        });
    });

    it('should reject when insufficient documents', (done) => {
      profileServiceStub.submitKYCForReview.rejects({
        code: 'INSUFFICIENT_DOCUMENTS',
        message: 'At least 2 KYC documents required'
      });
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .post('/api/v1/profile/kyc/submit')
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', false);
          expect(res.body.error.code).to.equal('INSUFFICIENT_DOCUMENTS');
          expect(res.body.error.message).to.include('at least 2');
          
          done();
        });
    });
  });

  describe('GET /api/v1/profile/kyc/status', () => {
    it('should return KYC status', (done) => {
      const mockProfile = {
        kycStatus: {
          level: 'BASIC',
          status: 'IN_REVIEW',
          submittedAt: '2024-01-01T00:00:00Z',
          reviewedAt: null,
          approvedAt: null,
          expiryDate: null,
          rejectionReason: null
        }
      };

      profileServiceStub.getCustomerProfile.resolves(mockProfile);
      profileRoutes.__set__('profileService', profileServiceStub);

      request(app)
        .get('/api/v1/profile/kyc/status')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('kycLevel', 'BASIC');
          expect(res.body.data).to.have.property('kycStatus', 'IN_REVIEW');
          
          done();
        });
    });
  });
});

