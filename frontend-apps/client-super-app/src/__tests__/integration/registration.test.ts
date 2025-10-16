import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { register } from '../../store/slices/auth.slice';
import * as authApi from '../../services/api/auth.api';

// Mock the auth API
vi.mock('../../services/api/auth.api');

describe('Registration Integration Test', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = {
      id: '123',
      userId: '123',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
      kycStatus: 'PENDING' as const,
      accountStatus: 'ACTIVE' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (authApi.authApi.register as any) = vi.fn().mockResolvedValue({
      data: mockUser,
    });

    const registrationData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    await store.dispatch(register(registrationData) as any);

    const state = store.getState().auth;
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle registration failure', async () => {
    (authApi.authApi.register as any) = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Email already in use',
          },
        },
      },
    });

    const registrationData = {
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    await store.dispatch(register(registrationData) as any);

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Email already in use');
  });
});

