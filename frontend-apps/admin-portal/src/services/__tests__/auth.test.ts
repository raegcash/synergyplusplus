import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { authService, User, LoginCredentials } from '../auth'

vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Auth Service', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    status: 'ACTIVE',
    groups: [
      { id: '1', name: 'Admins', code: 'ADMINS' },
    ],
    permissions: [
      { id: '1', name: 'Read', code: 'READ', module: 'SYSTEM', action: 'READ' },
      { id: '2', name: 'Write', code: 'WRITE', module: 'SYSTEM', action: 'WRITE' },
    ],
  }

  const mockToken = 'test-token-123'
  const mockCredentials: LoginCredentials = {
    username: 'testuser',
    password: 'password123',
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('successfully logs in and stores credentials', async () => {
      const mockResponse = {
        data: {
          token: mockToken,
          user: mockUser,
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.login(mockCredentials)

      expect(result.token).toBe(mockToken)
      expect(result.user).toEqual(mockUser)
      expect(localStorage.getItem('auth_token')).toBe(mockToken)
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser))
    })

    it('throws error on failed login', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'))

      await expect(authService.login(mockCredentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('clears session data on logout', async () => {
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      mockedAxios.post.mockResolvedValue({})

      await authService.logout()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })

    it('clears session even if API call fails', async () => {
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      mockedAxios.post.mockRejectedValue(new Error('Network error'))

      await authService.logout()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('verifyToken', () => {
    it('returns true for valid token', async () => {
      localStorage.setItem('auth_token', mockToken)
      mockedAxios.get.mockResolvedValue({ data: { valid: true } })

      const result = await authService.verifyToken()

      expect(result).toBe(true)
    })

    it('returns false for invalid token', async () => {
      localStorage.setItem('auth_token', mockToken)
      mockedAxios.get.mockRejectedValue(new Error('Invalid token'))

      const result = await authService.verifyToken()

      expect(result).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('returns false when no token exists', async () => {
      const result = await authService.verifyToken()

      expect(result).toBe(false)
    })
  })

  describe('getToken', () => {
    it('returns stored token', () => {
      localStorage.setItem('auth_token', mockToken)

      const token = authService.getToken()

      expect(token).toBe(mockToken)
    })

    it('returns null when no token exists', () => {
      const token = authService.getToken()

      expect(token).toBeNull()
    })
  })

  describe('getUser', () => {
    it('returns stored user', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const user = authService.getUser()

      expect(user).toEqual(mockUser)
    })

    it('returns null when no user exists', () => {
      const user = authService.getUser()

      expect(user).toBeNull()
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem('auth_user', 'invalid-json')

      const user = authService.getUser()

      expect(user).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token and user exist', () => {
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('returns false when only token exists', () => {
      localStorage.setItem('auth_token', mockToken)

      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })

    it('returns false when only user exists', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })

    it('returns false when neither exist', () => {
      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('hasPermission', () => {
    it('returns true for existing permission', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.hasPermission('READ')

      expect(result).toBe(true)
    })

    it('returns false for non-existing permission', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.hasPermission('DELETE')

      expect(result).toBe(false)
    })

    it('returns false when no user exists', () => {
      const result = authService.hasPermission('READ')

      expect(result).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true when user has at least one permission', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.hasAnyPermission(['READ', 'DELETE'])

      expect(result).toBe(true)
    })

    it('returns false when user has none of the permissions', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.hasAnyPermission(['DELETE', 'ADMIN'])

      expect(result).toBe(false)
    })
  })

  describe('inGroup', () => {
    it('returns true for existing group', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.inGroup('ADMINS')

      expect(result).toBe(true)
    })

    it('returns false for non-existing group', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      const result = authService.inGroup('USERS')

      expect(result).toBe(false)
    })

    it('returns false when no user exists', () => {
      const result = authService.inGroup('ADMINS')

      expect(result).toBe(false)
    })
  })

  describe('clearSession', () => {
    it('clears all session data', () => {
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('auth_user', JSON.stringify(mockUser))

      authService.clearSession()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('auth_user')).toBeNull()
    })
  })

  describe('getAuthHeader', () => {
    it('returns authorization header with token', () => {
      localStorage.setItem('auth_token', mockToken)

      const header = authService.getAuthHeader()

      expect(header).toEqual({ Authorization: `Bearer ${mockToken}` })
    })

    it('returns empty object when no token exists', () => {
      const header = authService.getAuthHeader()

      expect(header).toEqual({})
    })
  })
})

