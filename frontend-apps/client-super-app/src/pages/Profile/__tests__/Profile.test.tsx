import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/testUtils';
import Profile from '../Profile';

describe('Profile', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+63 912 345 6789',
  };

  it('renders profile page with user information', () => {
    const initialState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Profile />, { preloadedState: initialState });

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText(/Manage your account settings/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays profile tabs', () => {
    const initialState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Profile />, { preloadedState: initialState });

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('KYC Documents')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('enables editing when Edit Profile is clicked', async () => {
    const user = userEvent.setup();
    const initialState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Profile />, { preloadedState: initialState });

    const editButton = screen.getByRole('button', { name: /Edit Profile/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    // Check if fields are editable
    const firstNameInput = screen.getByLabelText('First Name');
    expect(firstNameInput).not.toBeDisabled();
  });

  it('displays user initials in avatar', () => {
    const initialState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Profile />, { preloadedState: initialState });

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    const initialState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Profile />, { preloadedState: initialState });

    const kycTab = screen.getByText('KYC Documents');
    await user.click(kycTab);

    await waitFor(() => {
      expect(screen.getByText(/Complete your KYC verification/i)).toBeInTheDocument();
    });
  });

  it('displays KYC document upload options', async () => {
    const user = userEvent.setup();
    const initialState = {
      auth: {
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Profile />, { preloadedState: initialState });

    const kycTab = screen.getByText('KYC Documents');
    await user.click(kycTab);

    await waitFor(() => {
      expect(screen.getByText('Valid ID')).toBeInTheDocument();
      expect(screen.getByText('Proof of Address')).toBeInTheDocument();
      expect(screen.getByText('Selfie Verification')).toBeInTheDocument();
    });
  });
});

