import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: string;
  groups: UserGroup[];
  permissions: Permission[];
}

export interface UserGroup {
  id: string;
  name: string;
  code: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  action: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/login`,
      credentials
    );
    
    // Store token and user in localStorage
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Logout and clear session
   */
  logout: async (): Promise<void> => {
    const token = authService.getToken();
    
    if (token) {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
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
      await axios.get(`${API_BASE_URL}/auth/verify`, {
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
  hasPermission: (permissionCode: string): boolean => {
    const user = authService.getUser();
    if (!user) return false;
    
    return user.permissions.some(p => p.code === permissionCode);
  },

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission: (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => authService.hasPermission(code));
  },

  /**
   * Check if user belongs to a specific group
   */
  inGroup: (groupCode: string): boolean => {
    const user = authService.getUser();
    if (!user) return false;
    
    return user.groups.some(g => g.code === groupCode);
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



