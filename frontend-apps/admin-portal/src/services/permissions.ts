import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { authService, Permission } from './auth';

const getHeaders = () => authService.getAuthHeader();

export const permissionsService = {
  getAll: async (): Promise<Permission[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/permissions`, {
      headers: getHeaders()
    });
    return response.data;
  },

  getByModule: async (module: string): Promise<Permission[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/permissions/by-module/${module}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Group permissions by module for easier display
  getAllGroupedByModule: async (): Promise<Record<string, Permission[]>> => {
    const permissions = await permissionsService.getAll();
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }
};



