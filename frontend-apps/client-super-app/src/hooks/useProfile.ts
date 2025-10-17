/**
 * Profile & KYC Hooks
 * React Query hooks for profile management
 * 
 * @module hooks/useProfile
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  getProfileCompletion,
  uploadKYCDocument,
  getKYCDocuments,
  submitKYCForReview,
  getKYCStatus,
  ProfileUpdateRequest,
  KYCUploadRequest,
} from '../services/api/profile.api';

// =====================================================
// PROFILE HOOKS
// =====================================================

/**
 * Hook to fetch customer profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update customer profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: ProfileUpdateRequest) => updateProfile(profileData),
    onSuccess: (data) => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
    },
  });
}

/**
 * Hook to fetch profile completion status
 */
export function useProfileCompletion() {
  return useQuery({
    queryKey: ['profileCompletion'],
    queryFn: getProfileCompletion,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =====================================================
// KYC HOOKS
// =====================================================

/**
 * Hook to fetch KYC documents
 */
export function useKYCDocuments() {
  return useQuery({
    queryKey: ['kycDocuments'],
    queryFn: getKYCDocuments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to upload KYC document
 */
export function useUploadKYCDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentData: KYCUploadRequest) => uploadKYCDocument(documentData),
    onSuccess: () => {
      // Invalidate KYC documents list
      queryClient.invalidateQueries({ queryKey: ['kycDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['kycStatus'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
    },
  });
}

/**
 * Hook to submit KYC for review
 */
export function useSubmitKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitKYCForReview,
    onSuccess: () => {
      // Invalidate profile and KYC status
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['kycStatus'] });
      queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
    },
  });
}

/**
 * Hook to fetch KYC status
 */
export function useKYCStatus() {
  return useQuery({
    queryKey: ['kycStatus'],
    queryFn: getKYCStatus,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

