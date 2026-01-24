import { apiClient } from "./apiClient";

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  dni?: string;
  birthdate?: string;
  genre?: string;
  role: "user" | "admin" | "superadmin";
  status: "active" | "inactive" | "suspended" | "cancelled" | "banned";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  rol: "user" | "admin" | "superadmin";
}

export interface UsersResponse {
  users?: User[];
  data?: User[];
  pages?: number;
  total?: number;
  currentPage?: number;
}

export const userService = {
  async getUsers(page = 1, limit = 10, search = ""): Promise<any> {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (search) params.search = search;
      const { data } = await apiClient.get("/api/users", { params });
      return data;
    } catch (error: any) {
<<<<<<< Updated upstream
      const msg =
        error.response?.data?.message ?? error.response?.data ?? error.message;
      throw new Error(
        typeof msg === "string" ? msg : "Error al obtener usuarios",
      );
=======
      const msg = error.response?.data?.message ?? error.response?.data ?? error.message;
    
>>>>>>> Stashed changes
    }
  },

  async updateUserStatus(
    userId: string,
    status: User["status"],
  ): Promise<void> {
    try {
      const statusMap: Record<string, string> = {
        active: "Active",
        banned: "Banned",
        cancelled: "Cancelled",
        inactive: "Inactive",
        suspended: "Suspended",
      };
      const backendStatus = statusMap[status.toLowerCase()] || status;
      await apiClient.put(`/api/users/${userId}/status`, {
        status: backendStatus,
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.response?.data?.details?.[0]?.message ??
        error.message;
      throw new Error(
        typeof msg === "string" ? msg : "Error al actualizar estado",
      );
    }
  },

  async updateUserRole(userId: string, role: User["role"]): Promise<User> {
    try {
      const roleMap: Record<string, string> = {
        user: "user",
        admin: "admin",
        superadmin: "superAdmin",
      };
      const backendRole = roleMap[role.toLowerCase()] || role;
      const { data: updatedUser } = await apiClient.put(
        `/api/users/${userId}/role`,
        { role: backendRole },
      );
      return updatedUser;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.response?.data?.details?.[0]?.message ??
        error.message;
      throw new Error(
        typeof msg === "string" ? msg : "Error al actualizar rol",
      );
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const filteredData = Object.fromEntries(
        Object.entries(userData).filter(
          ([_, value]) => value !== undefined && value !== null,
        ),
      );
      const { data: updatedUser } = await apiClient.put(
        `/api/users/${userId}`,
        filteredData,
      );
      return updatedUser;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.response?.data?.details?.[0]?.message ??
        error.message;
      throw new Error(
        typeof msg === "string" ? msg : "Error al actualizar usuario",
      );
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.updateUserStatus(userId, "cancelled");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message;
      throw new Error(
        typeof msg === "string" ? msg : "Error al cancelar usuario",
      );
    }
  },

  async getUserById(userId: string): Promise<User> {
    try {
      const { data: user } = await apiClient.get(`/api/users/${userId}`);
      return user;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message;
      throw new Error(
        typeof msg === "string" ? msg : "Error al obtener usuario",
      );
    }
  },
};
