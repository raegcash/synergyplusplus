import axios from 'axios';
import { AUTH_BASE_URL } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  tenantId: string;
  status: string;
  kycStatus: string;
  roles: Role[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${AUTH_BASE_URL}/auth/login`,
        credentials
      );
      
      // Store token and user in localStorage
      localStorage.setItem(TOKEN_KEY, response.data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      // Handle connection refused errors
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error(
          '🔴 Cannot connect to backend services.\n\n' +
          'Please ensure the following are running:\n' +
          '• Identity Service (port 8081)\n' +
          '• PostgreSQL (port 5432)\n\n' +
          'Start services with: ./START-COMPLETE.sh'
        );
      }
      
      // Handle 401 unauthorized
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      
      // Handle other errors
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      );
    }
  },

  /**
   * Logout and clear session
   */
  logout: async (): Promise<void> => {
    const token = authService.getToken();
    
    if (token) {
      try {
        await axios.post(`${AUTH_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Verify if token is still valid
   */
  verifyToken: async (): Promise<boolean> => {
    const token = authService.getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      await axios.get(`${AUTH_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      authService.clearSession();
      return false;
    }
  },

  /**
   * Get stored token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored user
   */
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken() && !!authService.getUser();
  },

  /**
   * Check if user has specific permission
   */
  hasPermission: (permissionName: string): boolean => {
    const user = authService.getUser();
    if (!user) return false;
    
    // Check all roles for the permission
    return user.roles.some(role => 
      role.permissions.some(p => p.name === permissionName)
    );
  },

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission: (permissionNames: string[]): boolean => {
    return permissionNames.some(name => authService.hasPermission(name));
  },

  /**
   * Check if user has a specific role
   */
  hasRole: (roleName: string): boolean => {
    const user = authService.getUser();
    if (!user) return false;
    
    return user.roles.some(r => r.name === roleName);
  },

  /**
   * Clear session data
   */
  clearSession: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get authorization header for API requests
   */
  getAuthHeader: (): Record<string, string> => {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};



