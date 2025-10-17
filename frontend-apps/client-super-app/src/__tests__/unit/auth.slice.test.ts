/**
 * Unit Tests for Auth Redux Slice
 */

import { describe, it, expect } from 'vitest';
import authReducer, {
  login,
  register,
  logout,
  loadUserFromStorage,
  clearError,
  setUser,
  clearAuth,
} from '../../store/slices/auth.slice';
import type { User } from '../../types/api.types';

const mockUser: User = {
  id: '123',
  userId: '123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+639123456789',
  kycStatus: 'PENDING',
  accountStatus: 'ACTIVE',
  createdAt: '2025-10-15T00:00:00Z',
  updatedAt: '2025-10-15T00:00:00Z',
};

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  describe('reducers', () => {
    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(stateWithError, clearError());

      expect(newState.error).toBeNull();
    });

    it('should handle setUser', () => {
      const newState = authReducer(initialState, setUser(mockUser));

      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should handle setUser with null', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const newState = authReducer(stateWithUser, setUser(null));

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it('should handle clearAuth', () => {
      const stateWithUser = {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: 'Some error',
      };

      const newState = authReducer(stateWithUser, clearAuth());

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('async thunks', () => {
    describe('login', () => {
      it('should set loading state on pending', () => {
        const action = { type: login.pending.type };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should set user on fulfilled', () => {
        const action = {
          type: login.fulfilled.type,
          payload: mockUser,
        };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.user).toEqual(mockUser);
        expect(newState.isAuthenticated).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should set error on rejected', () => {
        const action = {
          type: login.rejected.type,
          payload: 'Invalid credentials',
        };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.error).toBe('Invalid credentials');
        expect(newState.isAuthenticated).toBe(false);
      });
    });

    describe('register', () => {
      it('should set loading state on pending', () => {
        const action = { type: register.pending.type };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should set user on fulfilled', () => {
        const action = {
          type: register.fulfilled.type,
          payload: mockUser,
        };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.user).toEqual(mockUser);
        expect(newState.error).toBeNull();
      });

      it('should set error on rejected', () => {
        const action = {
          type: register.rejected.type,
          payload: 'Email already in use',
        };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.error).toBe('Email already in use');
      });
    });

    describe('logout', () => {
      it('should set loading state on pending', () => {
        const action = { type: logout.pending.type };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(true);
      });

      it('should clear user on fulfilled', () => {
        const stateWithUser = {
          ...initialState,
          user: mockUser,
          isAuthenticated: true,
        };

        const action = { type: logout.fulfilled.type };
        const newState = authReducer(stateWithUser, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.user).toBeNull();
        expect(newState.isAuthenticated).toBe(false);
        expect(newState.error).toBeNull();
      });

      it('should clear user even on rejected', () => {
        const stateWithUser = {
          ...initialState,
          user: mockUser,
          isAuthenticated: true,
        };

        const action = { type: logout.rejected.type };
        const newState = authReducer(stateWithUser, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.user).toBeNull();
        expect(newState.isAuthenticated).toBe(false);
      });
    });

    describe('loadUserFromStorage', () => {
      it('should set loading state on pending', () => {
        const action = { type: loadUserFromStorage.pending.type };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(true);
      });

      it('should set user on fulfilled', () => {
        const action = {
          type: loadUserFromStorage.fulfilled.type,
          payload: mockUser,
        };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.user).toEqual(mockUser);
        expect(newState.isAuthenticated).toBe(true);
        expect(newState.error).toBeNull();
      });

      it('should clear auth on rejected', () => {
        const action = { type: loadUserFromStorage.rejected.type };
        const newState = authReducer(initialState, action);

        expect(newState.isLoading).toBe(false);
        expect(newState.user).toBeNull();
        expect(newState.isAuthenticated).toBe(false);
      });
    });
  });
});

