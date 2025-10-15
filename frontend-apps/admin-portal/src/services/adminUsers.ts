import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { authService, UserGroup } from './auth';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  groups?: UserGroup[];
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  group_ids?: string[];
}

export interface UpdateAdminUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  status: string;
  password?: string;
  group_ids?: string[];
}

const getHeaders = () => authService.getAuthHeader();

export const adminUsersService = {
  getAll: async (): Promise<AdminUser[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders()
    });
    return response.data;
  },

  getById: async (id: string): Promise<AdminUser> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  create: async (data: CreateAdminUserRequest): Promise<AdminUser> => {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: UpdateAdminUserRequest): Promise<AdminUser> => {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
      headers: getHeaders()
    });
  }
};



