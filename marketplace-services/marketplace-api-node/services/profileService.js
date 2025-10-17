/**
 * Profile & KYC Service - Enterprise Grade
 * Handles customer profile management and KYC workflow
 * 
 * @module services/profileService
 * @version 1.0.0
 * @classification Production-Ready
 */

const db = require('../config/db-compat');
const { v4: uuidv4 } = require('uuid');

// =====================================================
// PROFILE MANAGEMENT
// =====================================================

/**
 * Get customer profile
 */
async function getCustomerProfile(customerId) {
  try {
    const profile = await db.get(`
      SELECT 
        p.*,
        c.email,
        c.status as account_status,
        c.created_at as account_created_at
      FROM customer_profiles p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.customer_id = $1
    `, [customerId]);

    if (!profile) {
      // Create default profile if not exists
      return await createDefaultProfile(customerId);
    }

    return formatProfileResponse(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    throw {
      code: 'PROFILE_ERROR',
      message: 'Failed to retrieve profile',
      details: error.message
    };
  }
}

/**
 * Update customer profile
 */
async function updateCustomerProfile(customerId, profileData) {
  try {
    const {
      firstName, middleName, lastName,
      dateOfBirth, gender, civilStatus, nationality,
      phoneNumber, mobileNumber,
      addressLine1, addressLine2, city, stateProvince, postalCode, country,
      employmentStatus, employerName, occupation, industry, monthlyIncome,
      sourceOfFunds, annualIncomeRange, netWorthRange,
      investmentExperience, riskTolerance, investmentGoals, investmentHorizon
    } = profileData;

    // Check if profile exists
    const existing = await db.get(
      'SELECT id FROM customer_profiles WHERE customer_id = $1',
      [customerId]
    );

    if (!existing) {
      // Create new profile
      await db.run(`
        INSERT INTO customer_profiles (
          customer_id, first_name, middle_name, last_name,
          date_of_birth, gender, civil_status, nationality,
          phone_number, mobile_number,
          address_line1, address_line2, city, state_province, postal_code, country,
          employment_status, employer_name, occupation, industry, monthly_income,
          source_of_funds, annual_income_range, net_worth_range,
          investment_experience, risk_tolerance, investment_goals, investment_horizon,
          updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        )
      `, [
        customerId, firstName, middleName, lastName,
        dateOfBirth, gender, civilStatus, nationality,
        phoneNumber, mobileNumber,
        addressLine1, addressLine2, city, stateProvince, postalCode, country,
        employmentStatus, employerName, occupation, industry, monthlyIncome,
        sourceOfFunds, annualIncomeRange, netWorthRange,
        investmentExperience, riskTolerance, investmentGoals, investmentHorizon,
        customerId
      ]);
    } else {
      // Update existing profile
      const updates = [];
      const params = [];
      let paramIndex = 1;

      if (firstName !== undefined) { updates.push(`first_name = $${paramIndex++}`); params.push(firstName); }
      if (middleName !== undefined) { updates.push(`middle_name = $${paramIndex++}`); params.push(middleName); }
      if (lastName !== undefined) { updates.push(`last_name = $${paramIndex++}`); params.push(lastName); }
      if (dateOfBirth !== undefined) { updates.push(`date_of_birth = $${paramIndex++}`); params.push(dateOfBirth); }
      if (gender !== undefined) { updates.push(`gender = $${paramIndex++}`); params.push(gender); }
      if (civilStatus !== undefined) { updates.push(`civil_status = $${paramIndex++}`); params.push(civilStatus); }
      if (nationality !== undefined) { updates.push(`nationality = $${paramIndex++}`); params.push(nationality); }
      if (phoneNumber !== undefined) { updates.push(`phone_number = $${paramIndex++}`); params.push(phoneNumber); }
      if (mobileNumber !== undefined) { updates.push(`mobile_number = $${paramIndex++}`); params.push(mobileNumber); }
      if (addressLine1 !== undefined) { updates.push(`address_line1 = $${paramIndex++}`); params.push(addressLine1); }
      if (addressLine2 !== undefined) { updates.push(`address_line2 = $${paramIndex++}`); params.push(addressLine2); }
      if (city !== undefined) { updates.push(`city = $${paramIndex++}`); params.push(city); }
      if (stateProvince !== undefined) { updates.push(`state_province = $${paramIndex++}`); params.push(stateProvince); }
      if (postalCode !== undefined) { updates.push(`postal_code = $${paramIndex++}`); params.push(postalCode); }
      if (country !== undefined) { updates.push(`country = $${paramIndex++}`); params.push(country); }
      if (employmentStatus !== undefined) { updates.push(`employment_status = $${paramIndex++}`); params.push(employmentStatus); }
      if (employerName !== undefined) { updates.push(`employer_name = $${paramIndex++}`); params.push(employerName); }
      if (occupation !== undefined) { updates.push(`occupation = $${paramIndex++}`); params.push(occupation); }
      if (industry !== undefined) { updates.push(`industry = $${paramIndex++}`); params.push(industry); }
      if (monthlyIncome !== undefined) { updates.push(`monthly_income = $${paramIndex++}`); params.push(monthlyIncome); }
      if (sourceOfFunds !== undefined) { updates.push(`source_of_funds = $${paramIndex++}`); params.push(sourceOfFunds); }
      if (annualIncomeRange !== undefined) { updates.push(`annual_income_range = $${paramIndex++}`); params.push(annualIncomeRange); }
      if (netWorthRange !== undefined) { updates.push(`net_worth_range = $${paramIndex++}`); params.push(netWorthRange); }
      if (investmentExperience !== undefined) { updates.push(`investment_experience = $${paramIndex++}`); params.push(investmentExperience); }
      if (riskTolerance !== undefined) { updates.push(`risk_tolerance = $${paramIndex++}`); params.push(riskTolerance); }
      if (investmentGoals !== undefined) { updates.push(`investment_goals = $${paramIndex++}`); params.push(investmentGoals); }
      if (investmentHorizon !== undefined) { updates.push(`investment_horizon = $${paramIndex++}`); params.push(investmentHorizon); }

      updates.push(`updated_by = $${paramIndex++}`);
      params.push(customerId);

      params.push(customerId); // For WHERE clause

      if (updates.length > 0) {
        await db.run(`
          UPDATE customer_profiles
          SET ${updates.join(', ')},
              updated_at = CURRENT_TIMESTAMP
          WHERE customer_id = $${paramIndex}
        `, params);
      }
    }

    return await getCustomerProfile(customerId);
  } catch (error) {
    console.error('Update profile error:', error);
    throw {
      code: 'PROFILE_UPDATE_ERROR',
      message: 'Failed to update profile',
      details: error.message
    };
  }
}

/**
 * Create default profile for new customer
 */
async function createDefaultProfile(customerId) {
  try {
    // Get customer email
    const customer = await db.get('SELECT email FROM customers WHERE id = $1', [customerId]);

    if (!customer) {
      throw new Error('Customer not found');
    }

    await db.run(`
      INSERT INTO customer_profiles (customer_id, created_by)
      VALUES ($1, $2)
    `, [customerId, customer.email]);

    // Create default notification preferences
    await db.run(`
      INSERT INTO notification_preferences (customer_id)
      VALUES ($1)
      ON CONFLICT (customer_id) DO NOTHING
    `, [customerId]);

    return await getCustomerProfile(customerId);
  } catch (error) {
    console.error('Create default profile error:', error);
    throw error;
  }
}

// =====================================================
// KYC DOCUMENT MANAGEMENT
// =====================================================

/**
 * Upload KYC document
 */
async function uploadKYCDocument(customerId, documentData) {
  try {
    const {
      documentType,
      documentNumber,
      documentIssuer,
      documentIssueDate,
      documentExpiryDate,
      fileName,
      filePath,
      fileSize,
      fileType
    } = documentData;

    // Get profile
    const profile = await db.get(
      'SELECT id FROM customer_profiles WHERE customer_id = $1',
      [customerId]
    );

    if (!profile) {
      throw { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' };
    }

    // Insert document
    const result = await db.run(`
      INSERT INTO kyc_documents (
        customer_id, profile_id,
        document_type, document_number, document_issuer,
        document_issue_date, document_expiry_date,
        file_name, file_path, file_size, file_type,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
      RETURNING id
    `, [
      customerId, profile.id,
      documentType, documentNumber, documentIssuer,
      documentIssueDate, documentExpiryDate,
      fileName, filePath, fileSize, fileType
    ]);

    return {
      id: result.rows[0].id,
      message: 'Document uploaded successfully',
      status: 'PENDING'
    };
  } catch (error) {
    console.error('Upload KYC document error:', error);
    throw {
      code: 'DOCUMENT_UPLOAD_ERROR',
      message: 'Failed to upload document',
      details: error.message
    };
  }
}

/**
 * Get customer KYC documents
 */
async function getKYCDocuments(customerId) {
  try {
    const documents = await db.all(`
      SELECT *
      FROM kyc_documents
      WHERE customer_id = $1
      ORDER BY uploaded_at DESC
    `, [customerId]);

    return documents.map(doc => ({
      id: doc.id,
      documentType: doc.document_type,
      documentNumber: doc.document_number,
      fileName: doc.file_name,
      status: doc.status,
      uploadedAt: doc.uploaded_at,
      verifiedAt: doc.verified_at,
      rejectionReason: doc.rejection_reason
    }));
  } catch (error) {
    console.error('Get KYC documents error:', error);
    throw {
      code: 'DOCUMENT_ERROR',
      message: 'Failed to retrieve documents',
      details: error.message
    };
  }
}

/**
 * Submit KYC for review
 */
async function submitKYCForReview(customerId) {
  try {
    // Check if profile is complete enough
    const profile = await db.get(`
      SELECT profile_completion_percentage, kyc_status
      FROM customer_profiles
      WHERE customer_id = $1
    `, [customerId]);

    if (!profile) {
      throw { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' };
    }

    if (profile.profile_completion_percentage < 80) {
      throw {
        code: 'INCOMPLETE_PROFILE',
        message: `Profile must be at least 80% complete. Current: ${profile.profile_completion_percentage}%`
      };
    }

    // Check if documents are uploaded
    const docCount = await db.get(`
      SELECT COUNT(*) as count
      FROM kyc_documents
      WHERE customer_id = $1 AND status != 'REJECTED'
    `, [customerId]);

    if (parseInt(docCount.count) < 2) {
      throw {
        code: 'INSUFFICIENT_DOCUMENTS',
        message: 'At least 2 KYC documents required'
      };
    }

    // Update KYC status
    await db.run(`
      UPDATE customer_profiles
      SET kyc_status = 'IN_REVIEW',
          kyc_submitted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $1
    `, [customerId]);

    return {
      success: true,
      message: 'KYC submitted for review',
      status: 'IN_REVIEW'
    };
  } catch (error) {
    if (error.code) throw error;
    console.error('Submit KYC error:', error);
    throw {
      code: 'KYC_SUBMIT_ERROR',
      message: 'Failed to submit KYC',
      details: error.message
    };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatProfileResponse(profile) {
  return {
    id: profile.id,
    customerId: profile.customer_id,
    personalInfo: {
      firstName: profile.first_name,
      middleName: profile.middle_name,
      lastName: profile.last_name,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender,
      civilStatus: profile.civil_status,
      nationality: profile.nationality
    },
    contactInfo: {
      email: profile.email,
      phoneNumber: profile.phone_number,
      mobileNumber: profile.mobile_number,
      emailVerified: profile.email_verified,
      phoneVerified: profile.phone_verified
    },
    addressInfo: {
      addressLine1: profile.address_line1,
      addressLine2: profile.address_line2,
      city: profile.city,
      stateProvince: profile.state_province,
      postalCode: profile.postal_code,
      country: profile.country
    },
    employmentInfo: {
      employmentStatus: profile.employment_status,
      employerName: profile.employer_name,
      occupation: profile.occupation,
      industry: profile.industry,
      monthlyIncome: profile.monthly_income ? parseFloat(profile.monthly_income) : null
    },
    financialInfo: {
      sourceOfFunds: profile.source_of_funds,
      annualIncomeRange: profile.annual_income_range,
      netWorthRange: profile.net_worth_range
    },
    investmentProfile: {
      investmentExperience: profile.investment_experience,
      riskTolerance: profile.risk_tolerance,
      investmentGoals: profile.investment_goals,
      investmentHorizon: profile.investment_horizon
    },
    kycStatus: {
      level: profile.kyc_level,
      status: profile.kyc_status,
      submittedAt: profile.kyc_submitted_at,
      reviewedAt: profile.kyc_reviewed_at,
      approvedAt: profile.kyc_approved_at,
      expiryDate: profile.kyc_expiry_date,
      rejectionReason: profile.kyc_rejection_reason
    },
    profileCompletion: {
      completed: profile.profile_completed,
      percentage: profile.profile_completion_percentage
    },
    metadata: {
      accountStatus: profile.account_status,
      accountCreatedAt: profile.account_created_at,
      profileCreatedAt: profile.created_at,
      profileUpdatedAt: profile.updated_at
    }
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  uploadKYCDocument,
  getKYCDocuments,
  submitKYCForReview,
};

