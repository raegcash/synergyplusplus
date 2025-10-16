import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import * as AuthContext from '../../contexts/AuthContext'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: any) => <div>Navigating to {to}</div>,
  }
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated and not loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        status: 'ACTIVE',
        groups: [],
        permissions: [],
      },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      inGroup: vi.fn(),
    })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading state when authentication is loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      loading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      inGroup: vi.fn(),
    })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn(),
      hasAnyPermission: vi.fn(),
      inGroup: vi.fn(),
    })

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )

    expect(screen.getByText('Navigating to /login')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

