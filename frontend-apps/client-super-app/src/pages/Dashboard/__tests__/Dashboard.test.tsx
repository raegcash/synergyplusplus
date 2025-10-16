import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/testUtils';
import Dashboard from '../Dashboard';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard', () => {
  it('renders dashboard with welcome message', async () => {
    const initialState = {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Dashboard />, { preloadedState: initialState });

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John/i)).toBeInTheDocument();
    });
  });

  it('displays summary cards', async () => {
    const initialState = {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Dashboard />, { preloadedState: initialState });

    await waitFor(() => {
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText("Today's Gain/Loss")).toBeInTheDocument();
      expect(screen.getByText('Total Investments')).toBeInTheDocument();
      expect(screen.getByText('Available Cash')).toBeInTheDocument();
    });
  });

  it('navigates to marketplace when Buy Assets is clicked', async () => {
    const user = userEvent.setup();
    const initialState = {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Dashboard />, { preloadedState: initialState });

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    const buyButton = screen.getByRole('button', { name: /Buy Assets/i });
    await user.click(buyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/marketplace');
  });

  it('displays quick actions buttons', async () => {
    const initialState = {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Dashboard />, { preloadedState: initialState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Buy Assets/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sell Assets/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Transactions/i })).toBeInTheDocument();
    });
  });

  it('shows getting started section', async () => {
    const initialState = {
      auth: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderWithProviders(<Dashboard />, { preloadedState: initialState });

    await waitFor(() => {
      expect(screen.getByText('Get Started with Investing')).toBeInTheDocument();
      expect(screen.getByText(/Browse our marketplace/i)).toBeInTheDocument();
    });
  });
});

