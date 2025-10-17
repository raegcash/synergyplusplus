/**
 * Profile Component Tests
 * Tests for Profile page functionality
 * 
 * @module pages/Profile/__tests__/Profile.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from '../Profile';
import * as profileHooks from '../../../hooks/useProfile';

// Mock hooks
vi.mock('../../../hooks/useProfile');

const mockProfile = {
  id: '123',
  customerId: 'customer-123',
  personalInfo: {
    firstName: 'John',
    middleName: 'Q',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'MALE',
  },
  contactInfo: {
    email: 'john.doe@example.com',
    mobileNumber: '+639171234567',
    emailVerified: true,
    phoneVerified: false,
  },
  addressInfo: {
    addressLine1: '123 Main St',
    city: 'Manila',
    postalCode: '1000',
  },
  employmentInfo: {
    employmentStatus: 'EMPLOYED',
    occupation: 'Software Engineer',
    monthlyIncome: 50000,
  },
  financialInfo: {
    sourceOfFunds: 'Salary',
    annualIncomeRange: '500K-1M',
  },
  investmentProfile: {
    investmentExperience: 'INTERMEDIATE',
    riskTolerance: 'MODERATE',
    investmentGoals: 'Long-term growth',
  },
  kycStatus: {
    level: 'NONE',
    status: 'PENDING',
  },
  profileCompletion: {
    completed: false,
    percentage: 65,
  },
};

describe('Profile Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Mock hooks
    vi.mocked(profileHooks.useProfile).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(profileHooks.useUpdateProfile).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);

    vi.mocked(profileHooks.useKYCDocuments).mockReturnValue({
      data: [],
    } as any);

    vi.mocked(profileHooks.useUploadKYCDocument).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(profileHooks.useSubmitKYC).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
  });

  const renderProfile = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Profile />
      </QueryClientProvider>
    );
  };

  it('should render profile page', () => {
    renderProfile();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('should display profile completion percentage', () => {
    renderProfile();
    expect(screen.getByText('65% complete')).toBeInTheDocument();
  });

  it('should display KYC status', () => {
    renderProfile();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render all tabs', () => {
    renderProfile();
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Employment')).toBeInTheDocument();
    expect(screen.getByText('Financial')).toBeInTheDocument();
    expect(screen.getByText('Investment Profile')).toBeInTheDocument();
    expect(screen.getByText('KYC Documents')).toBeInTheDocument();
  });

  it('should display personal information', () => {
    renderProfile();
    // Personal info is displayed in the first tab by default
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });

  it('should enable edit mode when Edit button is clicked', async () => {
    renderProfile();
    
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should handle tab changes', async () => {
    renderProfile();
    
    const employmentTab = screen.getByText('Employment');
    fireEvent.click(employmentTab);

    await waitFor(() => {
      expect(screen.getByText('Employment Information')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    vi.mocked(profileHooks.useProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    renderProfile();
    // CircularProgress should be shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(profileHooks.useProfile).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    } as any);

    renderProfile();
    expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
  });
});
