/**
 * Profile & KYC Routes - Enterprise Grade
 * API endpoints for profile management and KYC workflow
 * 
 * @module routes/profile
 * @version 1.0.0
 * @classification Production-Ready
 */

const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');
const { authMiddleware } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authMiddleware);

// =====================================================
// PROFILE ROUTES
// =====================================================

/**
 * @route   GET /api/v1/profile
 * @desc    Get customer profile
 * @access  Private (Customer)
 */
router.get('/', async (req, res) => {
  try {
    const customerId = req.user.id;
    const profile = await profileService.getCustomerProfile(customerId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(error.code === 'PROFILE_NOT_FOUND' ? 404 : 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        details: error.details
      }
    });
  }
});

/**
 * @route   PUT /api/v1/profile
 * @desc    Update customer profile
 * @access  Private (Customer)
 */
router.put('/', async (req, res) => {
  try {
    const customerId = req.user.id;
    const profileData = req.body;

    // Validate required fields for profile updates
    validateProfileData(profileData);

    const profile = await profileService.updateCustomerProfile(customerId, profileData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(error.code === 'VALIDATION_ERROR' ? 400 : 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        details: error.details
      }
    });
  }
});

/**
 * @route   GET /api/v1/profile/completion
 * @desc    Get profile completion status
 * @access  Private (Customer)
 */
router.get('/completion', async (req, res) => {
  try {
    const customerId = req.user.id;
    const profile = await profileService.getCustomerProfile(customerId);

    res.status(200).json({
      success: true,
      data: {
        completed: profile.profileCompletion.completed,
        percentage: profile.profileCompletion.percentage,
        missingFields: calculateMissingFields(profile)
      }
    });
  } catch (error) {
    console.error('Get completion error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error'
      }
    });
  }
});

// =====================================================
// KYC DOCUMENT ROUTES
// =====================================================

/**
 * @route   POST /api/v1/profile/kyc/documents
 * @desc    Upload KYC document
 * @access  Private (Customer)
 */
router.post('/kyc/documents', async (req, res) => {
  try {
    const customerId = req.user.id;
    const documentData = req.body;

    // Validate document data
    validateDocumentData(documentData);

    const result = await profileService.uploadKYCDocument(customerId, documentData);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(error.code === 'VALIDATION_ERROR' ? 400 : 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        details: error.details
      }
    });
  }
});

/**
 * @route   GET /api/v1/profile/kyc/documents
 * @desc    Get all KYC documents for customer
 * @access  Private (Customer)
 */
router.get('/kyc/documents', async (req, res) => {
  try {
    const customerId = req.user.id;
    const documents = await profileService.getKYCDocuments(customerId);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error'
      }
    });
  }
});

/**
 * @route   POST /api/v1/profile/kyc/submit
 * @desc    Submit KYC for review
 * @access  Private (Customer)
 */
router.post('/kyc/submit', async (req, res) => {
  try {
    const customerId = req.user.id;
    const result = await profileService.submitKYCForReview(customerId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        status: result.status
      }
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    const statusCode = error.code === 'INCOMPLETE_PROFILE' || error.code === 'INSUFFICIENT_DOCUMENTS' ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        details: error.details
      }
    });
  }
});

/**
 * @route   GET /api/v1/profile/kyc/status
 * @desc    Get KYC status
 * @access  Private (Customer)
 */
router.get('/kyc/status', async (req, res) => {
  try {
    const customerId = req.user.id;
    const profile = await profileService.getCustomerProfile(customerId);

    res.status(200).json({
      success: true,
      data: {
        kycLevel: profile.kycStatus.level,
        kycStatus: profile.kycStatus.status,
        submittedAt: profile.kycStatus.submittedAt,
        reviewedAt: profile.kycStatus.reviewedAt,
        approvedAt: profile.kycStatus.approvedAt,
        expiryDate: profile.kycStatus.expiryDate,
        rejectionReason: profile.kycStatus.rejectionReason
      }
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Internal server error'
      }
    });
  }
});

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

function validateProfileData(data) {
  const errors = [];

  // Date validations
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365);
    if (age < 18) {
      errors.push('Customer must be at least 18 years old');
    }
    if (age > 120) {
      errors.push('Invalid date of birth');
    }
  }

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation (basic)
  if (data.mobileNumber && !/^[0-9+\-\s()]+$/.test(data.mobileNumber)) {
    errors.push('Invalid mobile number format');
  }

  // Income validation
  if (data.monthlyIncome !== undefined) {
    const income = parseFloat(data.monthlyIncome);
    if (isNaN(income) || income < 0) {
      errors.push('Monthly income must be a positive number');
    }
  }

  // Enum validations
  const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
  if (data.gender && !validGenders.includes(data.gender)) {
    errors.push(`Gender must be one of: ${validGenders.join(', ')}`);
  }

  const validEmploymentStatuses = ['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'RETIRED'];
  if (data.employmentStatus && !validEmploymentStatuses.includes(data.employmentStatus)) {
    errors.push(`Employment status must be one of: ${validEmploymentStatuses.join(', ')}`);
  }

  const validExperiences = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
  if (data.investmentExperience && !validExperiences.includes(data.investmentExperience)) {
    errors.push(`Investment experience must be one of: ${validExperiences.join(', ')}`);
  }

  const validRiskTolerances = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'];
  if (data.riskTolerance && !validRiskTolerances.includes(data.riskTolerance)) {
    errors.push(`Risk tolerance must be one of: ${validRiskTolerances.join(', ')}`);
  }

  if (errors.length > 0) {
    throw {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors
    };
  }
}

function validateDocumentData(data) {
  const errors = [];

  if (!data.documentType) {
    errors.push('Document type is required');
  }

  const validDocTypes = [
    'VALID_ID',
    'PROOF_OF_ADDRESS',
    'SELFIE',
    'TAX_ID',
    'BANK_STATEMENT'
  ];

  if (data.documentType && !validDocTypes.includes(data.documentType)) {
    errors.push(`Document type must be one of: ${validDocTypes.join(', ')}`);
  }

  if (!data.fileName) {
    errors.push('File name is required');
  }

  if (!data.filePath) {
    errors.push('File path is required');
  }

  if (!data.fileType) {
    errors.push('File type is required');
  }

  const validFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (data.fileType && !validFileTypes.includes(data.fileType)) {
    errors.push(`File type must be one of: ${validFileTypes.join(', ')}`);
  }

  if (errors.length > 0) {
    throw {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors
    };
  }
}

function calculateMissingFields(profile) {
  const missing = [];

  if (!profile.personalInfo.firstName) missing.push('First Name');
  if (!profile.personalInfo.lastName) missing.push('Last Name');
  if (!profile.personalInfo.dateOfBirth) missing.push('Date of Birth');
  if (!profile.personalInfo.gender) missing.push('Gender');
  if (!profile.contactInfo.mobileNumber) missing.push('Mobile Number');
  if (!profile.addressInfo.addressLine1) missing.push('Address');
  if (!profile.addressInfo.city) missing.push('City');
  if (!profile.addressInfo.postalCode) missing.push('Postal Code');
  if (!profile.employmentInfo.employmentStatus) missing.push('Employment Status');
  if (!profile.employmentInfo.occupation) missing.push('Occupation');
  if (!profile.employmentInfo.monthlyIncome) missing.push('Monthly Income');
  if (!profile.financialInfo.sourceOfFunds) missing.push('Source of Funds');
  if (!profile.investmentProfile.investmentExperience) missing.push('Investment Experience');
  if (!profile.investmentProfile.riskTolerance) missing.push('Risk Tolerance');
  if (!profile.investmentProfile.investmentGoals) missing.push('Investment Goals');

  return missing;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = router;

