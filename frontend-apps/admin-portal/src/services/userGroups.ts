import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { authService, Permission } from './auth';
import { AdminUser } from './adminUsers';

export interface UserGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_by?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  members?: AdminUser[];
  permissions?: Permission[];
}

export interface CreateUserGroupRequest {
  name: string;
  code: string;
  description?: string;
  permission_ids?: string[];
}

export interface UpdateUserGroupRequest {
  name: string;
  code: string;
  description?: string;
  status: string;
  permission_ids?: string[];
}

const getHeaders = () => authService.getAuthHeader();

export const userGroupsService = {
  getAll: async (): Promise<UserGroup[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/groups`, {
      headers: getHeaders()
    });
    return response.data;
  },

  getById: async (id: string): Promise<UserGroup> => {
    const response = await axios.get(`${API_BASE_URL}/admin/groups/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  create: async (data: CreateUserGroupRequest): Promise<UserGroup> => {
    const response = await axios.post(`${API_BASE_URL}/admin/groups`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  update: async (id: string, data: UpdateUserGroupRequest): Promise<UserGroup> => {
    const response = await axios.put(`${API_BASE_URL}/admin/groups/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/admin/groups/${id}`, {
      headers: getHeaders()
    });
  },

  addMember: async (groupId: string, userId: string): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/admin/groups/${groupId}/members/${userId}`,
      {},
      { headers: getHeaders() }
    );
  },

  removeMember: async (groupId: string, userId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/admin/groups/${groupId}/members/${userId}`,
      { headers: getHeaders() }
    );
  }
};



