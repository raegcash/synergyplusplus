import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test/testUtils';
import Login from '../Login';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const loginButton = screen.getByRole('button', { name: /Sign In/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
  });

  it('should enable form submission when fields are valid', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Sign In/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(loginButton).not.toBeDisabled();
  });

  it('should have link to register page', () => {
    render(<Login />);
    
    const registerLink = screen.getByText(/Don't have an account/i).closest('div')?.querySelector('a');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});

