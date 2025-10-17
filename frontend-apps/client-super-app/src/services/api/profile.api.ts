/**
 * Profile & KYC API Client
 * Frontend API client for profile management and KYC operations
 * 
 * @module services/api/profile.api
 * @version 1.0.0
 */

import { apiClient } from './client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface ProfileData {
  id: string;
  customerId: string;
  personalInfo: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    civilStatus?: string;
    nationality?: string;
  };
  contactInfo: {
    email: string;
    phoneNumber?: string;
    mobileNumber?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  addressInfo: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
  };
  employmentInfo: {
    employmentStatus?: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'RETIRED';
    employerName?: string;
    occupation?: string;
    industry?: string;
    monthlyIncome?: number;
  };
  financialInfo: {
    sourceOfFunds?: string;
    annualIncomeRange?: string;
    netWorthRange?: string;
  };
  investmentProfile: {
    investmentExperience?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    riskTolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    investmentGoals?: string;
    investmentHorizon?: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  };
  kycStatus: {
    level: string;
    status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
    submittedAt?: string;
    reviewedAt?: string;
    approvedAt?: string;
    expiryDate?: string;
    rejectionReason?: string;
  };
  profileCompletion: {
    completed: boolean;
    percentage: number;
  };
  metadata: {
    accountStatus: string;
    accountCreatedAt: string;
    profileCreatedAt: string;
    profileUpdatedAt: string;
  };
}

export interface ProfileUpdateRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  employmentStatus?: string;
  employerName?: string;
  occupation?: string;
  industry?: string;
  monthlyIncome?: number;
  sourceOfFunds?: string;
  annualIncomeRange?: string;
  netWorthRange?: string;
  investmentExperience?: string;
  riskTolerance?: string;
  investmentGoals?: string;
  investmentHorizon?: string;
}

export interface KYCDocument {
  id: string;
  documentType: 'VALID_ID' | 'PROOF_OF_ADDRESS' | 'SELFIE' | 'TAX_ID' | 'BANK_STATEMENT';
  documentNumber?: string;
  fileName: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface KYCUploadRequest {
  documentType: string;
  documentNumber?: string;
  documentIssuer?: string;
  documentIssueDate?: string;
  documentExpiryDate?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}

export interface ProfileCompletionStatus {
  completed: boolean;
  percentage: number;
  missingFields: string[];
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Get customer profile
 */
export async function getProfile(): Promise<ProfileData> {
  const response = await apiClient.get('/api/v1/profile');
  return response.data.data;
}

/**
 * Update customer profile
 */
export async function updateProfile(profileData: ProfileUpdateRequest): Promise<ProfileData> {
  const response = await apiClient.put('/api/v1/profile', profileData);
  return response.data.data;
}

/**
 * Get profile completion status
 */
export async function getProfileCompletion(): Promise<ProfileCompletionStatus> {
  const response = await apiClient.get('/api/v1/profile/completion');
  return response.data.data;
}

/**
 * Upload KYC document
 */
export async function uploadKYCDocument(documentData: KYCUploadRequest): Promise<any> {
  const response = await apiClient.post('/api/v1/profile/kyc/documents', documentData);
  return response.data.data;
}

/**
 * Get KYC documents
 */
export async function getKYCDocuments(): Promise<KYCDocument[]> {
  const response = await apiClient.get('/api/v1/profile/kyc/documents');
  return response.data.data;
}

/**
 * Submit KYC for review
 */
export async function submitKYCForReview(): Promise<any> {
  const response = await apiClient.post('/api/v1/profile/kyc/submit');
  return response.data;
}

/**
 * Get KYC status
 */
export async function getKYCStatus(): Promise<any> {
  const response = await apiClient.get('/api/v1/profile/kyc/status');
  return response.data.data;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate profile completion percentage locally
 */
export function calculateCompletion(profile: ProfileData): number {
  let score = 0;
  const fields = [
    profile.personalInfo.firstName,
    profile.personalInfo.lastName,
    profile.personalInfo.dateOfBirth,
    profile.personalInfo.gender,
    profile.contactInfo.mobileNumber,
    profile.addressInfo.addressLine1,
    profile.addressInfo.city,
    profile.addressInfo.postalCode,
    profile.employmentInfo.employmentStatus,
    profile.employmentInfo.occupation,
    profile.employmentInfo.monthlyIncome,
    profile.financialInfo.sourceOfFunds,
    profile.investmentProfile.investmentExperience,
    profile.investmentProfile.riskTolerance,
    profile.investmentProfile.investmentGoals,
  ];

  fields.forEach(field => {
    if (field !== null && field !== undefined && field !== '') {
      score += 5;
    }
  });

  if (profile.contactInfo.emailVerified) score += 5;
  if (profile.contactInfo.phoneVerified) score += 5;
  if (profile.kycStatus.status === 'APPROVED' || profile.kycStatus.status === 'IN_REVIEW') {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Get KYC status display info
 */
export function getKYCStatusInfo(status: string): { color: string; label: string } {
  switch (status) {
    case 'APPROVED':
      return { color: 'success', label: 'Approved' };
    case 'IN_REVIEW':
      return { color: 'info', label: 'Under Review' };
    case 'REJECTED':
      return { color: 'error', label: 'Rejected' };
    case 'EXPIRED':
      return { color: 'warning', label: 'Expired' };
    case 'PENDING':
    default:
      return { color: 'default', label: 'Pending' };
  }
}

