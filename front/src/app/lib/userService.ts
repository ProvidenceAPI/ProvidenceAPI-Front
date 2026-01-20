import { apiClient } from './apiClient';

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  dni?: string;
  birthdate?: string;
  genre?: string;
  role: 'user' | 'admin' | 'superAdmin';
  status: 'active' | 'inactive' | 'suspended' | 'cancelled' | 'banned' | 'Cancelled' | 'Active' | 'Inactive' | 'Banned';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersResponse {
  users?: User[];
  data?: User[];
  pages?: number;
  total?: number;
  currentPage?: number;
}

export const userService = {
  async getUsers(page = 1, limit = 10, search = ''): Promise<any> {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (search) params.search = search;
      const { data } = await apiClient.get('/api/users', { params });
      return data;
    } catch (error: any) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      throw new Error(typeof msg === 'string' ? msg : 'Error al obtener usuarios');
    }
  },

  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    try {
      await apiClient.put(`/api/users/${userId}/status`, { status });
    } catch (error: any) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      throw new Error(typeof msg === 'string' ? msg : 'Error al actualizar estado');
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const { data: updatedUser } = await apiClient.put(`/api/users/${userId}`, data);
      return updatedUser;
    } catch (error: any) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      throw new Error(typeof msg === 'string' ? msg : 'Error al actualizar usuario');
    }
  },

  async deleteUser(userId: string): Promise<void> {
    await userService.updateUserStatus(userId, 'Cancelled');
  },

  async getUserById(userId: string): Promise<User> {
    try {
      const { data: user } = await apiClient.get(`/api/users/${userId}`);
      return user;
    } catch (error: any) {
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
      throw new Error(typeof msg === 'string' ? msg : 'Error al obtener usuario');
    }
  },
};
