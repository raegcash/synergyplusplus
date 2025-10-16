import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearError, setUser, clearAuth } from '../auth.slice';
import type { User } from '../../../types/api.types';

describe('Auth Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should have correct initial state', () => {
    const state = store.getState().auth;
    expect(state).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should clear error', () => {
    // Set an error first
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Test error',
        },
      },
    });

    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });

  it('should set user', () => {
    const mockUser: User = {
      id: '123',
      userId: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      kycStatus: 'PENDING',
      accountStatus: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    store.dispatch(setUser(mockUser));
    const state = store.getState().auth;
    
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear auth', () => {
    const mockUser: User = {
      id: '123',
      userId: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      kycStatus: 'PENDING',
      accountStatus: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    // Set user first
    store.dispatch(setUser(mockUser));
    expect(store.getState().auth.isAuthenticated).toBe(true);

    // Clear auth
    store.dispatch(clearAuth());
    const state = store.getState().auth;
    
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });
});

