import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/testUtils'
import { Login } from '../Login'
import * as AuthContext from '../../contexts/AuthContext'

describe('Login Page', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      user: null,
      loading: false,
      isAuthenticated: false,
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      inGroup: vi.fn(),
    })
  })

  it('renders login form correctly', () => {
    render(<Login />)

    expect(screen.getByText('Admin Portal')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the management portal')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays default credentials info', () => {
    render(<Login />)

    expect(screen.getByText(/Default Credentials:/i)).toBeInTheDocument()
    
    // Check for multiple instances of Username/Password/admin text
    const usernameTexts = screen.getAllByText(/Username:/i)
    expect(usernameTexts.length).toBeGreaterThan(0)
    
    const adminTexts = screen.getAllByText(/admin/i)
    expect(adminTexts.length).toBeGreaterThan(0)
    
    const passwordTexts = screen.getAllByText(/Password:/i)
    expect(passwordTexts.length).toBeGreaterThan(0)
  })

  it('handles username input correctly', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    await user.type(usernameInput, 'testuser')

    expect(usernameInput).toHaveValue('testuser')
  })

  it('handles password input correctly', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'testpassword')

    expect(passwordInput).toHaveValue('testpassword')
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: '' })

    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'Admin@123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin',
        password: 'Admin@123',
      })
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValue({
      response: { data: { error: errorMessage } },
    })

    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'wronguser')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('displays generic error on network failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('Network error'))

    render(<Login />)

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'Admin@123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('disables form fields while logging in', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<Login />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'Admin@123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })

  it('requires username field', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    expect(usernameInput).toBeRequired()
  })

  it('requires password field', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toBeRequired()
  })
})

