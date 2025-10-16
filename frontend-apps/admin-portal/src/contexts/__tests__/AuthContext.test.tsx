import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import * as authService from '../../services/auth'
import { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

// Mock the auth service
vi.mock('../../services/auth')

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
)

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    status: 'ACTIVE',
    groups: [{ id: '1', name: 'Admins', code: 'ADMINS' }],
    permissions: [{ id: '1', name: 'Read', code: 'READ', module: 'SYSTEM', action: 'READ' }],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(authService.authService.getUser as any).mockReturnValue(null)
    ;(authService.authService.getToken as any).mockReturnValue(null)
    ;(authService.authService.verifyToken as any).mockResolvedValue(false)
  })

  it('provides auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('checks authentication on mount', async () => {
    ;(authService.authService.getUser as any).mockReturnValue(mockUser)
    ;(authService.authService.getToken as any).mockReturnValue('test-token')
    ;(authService.authService.verifyToken as any).mockResolvedValue(true)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('clears session on invalid token', async () => {
    ;(authService.authService.getUser as any).mockReturnValue(mockUser)
    ;(authService.authService.getToken as any).mockReturnValue('invalid-token')
    ;(authService.authService.verifyToken as any).mockResolvedValue(false)
    ;(authService.authService.clearSession as any).mockImplementation(() => {})

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(authService.authService.clearSession).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })

  it('handles login successfully', async () => {
    const mockLoginResponse = { token: 'test-token', user: mockUser }
    ;(authService.authService.login as any).mockResolvedValue(mockLoginResponse)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.login({ username: 'testuser', password: 'password' })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles login error', async () => {
    const error = new Error('Invalid credentials')
    ;(authService.authService.login as any).mockRejectedValue(error)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(
      result.current.login({ username: 'testuser', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials')
  })

  it('handles logout', async () => {
    // Setup authenticated state
    ;(authService.authService.getUser as any).mockReturnValue(mockUser)
    ;(authService.authService.getToken as any).mockReturnValue('test-token')
    ;(authService.authService.verifyToken as any).mockResolvedValue(true)
    ;(authService.authService.logout as any).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    await result.current.logout()

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('checks permissions correctly', async () => {
    ;(authService.authService.getUser as any).mockReturnValue(mockUser)
    ;(authService.authService.getToken as any).mockReturnValue('test-token')
    ;(authService.authService.verifyToken as any).mockResolvedValue(true)
    ;(authService.authService.hasPermission as any).mockReturnValue(true)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const hasPermission = result.current.hasPermission('READ')
    expect(authService.authService.hasPermission).toHaveBeenCalledWith('READ')
    expect(hasPermission).toBe(true)
  })

  it('checks any permissions correctly', async () => {
    ;(authService.authService.getUser as any).mockReturnValue(mockUser)
    ;(authService.authService.getToken as any).mockReturnValue('test-token')
    ;(authService.authService.verifyToken as any).mockResolvedValue(true)
    ;(authService.authService.hasAnyPermission as any).mockReturnValue(true)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const hasAnyPermission = result.current.hasAnyPermission(['READ', 'WRITE'])
    expect(authService.authService.hasAnyPermission).toHaveBeenCalledWith(['READ', 'WRITE'])
    expect(hasAnyPermission).toBe(true)
  })

  it('checks group membership correctly', async () => {
    ;(authService.authService.getUser as any).mockReturnValue(mockUser)
    ;(authService.authService.getToken as any).mockReturnValue('test-token')
    ;(authService.authService.verifyToken as any).mockResolvedValue(true)
    ;(authService.authService.inGroup as any).mockReturnValue(true)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const inGroup = result.current.inGroup('ADMINS')
    expect(authService.authService.inGroup).toHaveBeenCalledWith('ADMINS')
    expect(inGroup).toBe(true)
  })

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleError.mockRestore()
  })
})

