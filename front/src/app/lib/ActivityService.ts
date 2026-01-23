import { apiClient } from "./apiClient";
import { Activity } from "src/interfaces/Activity";

export interface CreateActivityDTO {
  name: string;
  description: string;
  capacity: number;
  duration: number;
  price: number;
  schedule: string[];
  trainer: string;
  hasFreeTrial: boolean;
}

export interface UpdateActivityDTO {
  name?: string;
  description?: string;
  capacity?: number;
  duration?: number;
  price?: number;
  schedule?: string[];
  trainer?: string;
  hasFreeTrial?: boolean;
}

export const activityService = {
  getAllActivities: async (): Promise<Activity[]> => {
    try {
      const response = await apiClient.get("/api/activities");
      const rawData: any = response.data;
      const activities = rawData.data || rawData;
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      throw error;
    }
  },

  getActiveActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get("/api/activities/active");
    const rawData: any = response.data;
    const activities = rawData.data || rawData;
    return Array.isArray(activities) ? activities : [];
  },

  getActivityById: async (activityId: string | number): Promise<Activity> => {
    const response = await apiClient.get(`/api/activities/${activityId}`);
    const rawData: any = response.data;
    const activity = rawData.data || rawData;
    return activity;
  },

  createActivity: async (body: CreateActivityDTO): Promise<Activity> => {
    const { data } = await apiClient.post("/api/activities", body);
    return Array.isArray(data) ? data[0] : (data?.data ?? data);
  },

  updateActivity: async (
    id: string,
    body: UpdateActivityDTO,
  ): Promise<Activity> => {
    const { data } = await apiClient.put(`/api/activities/${id}`, body);
    return data?.data ?? data;
  },

  deleteActivity: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/activities/${id}`);
  },

  uploadActivityImage: async (id: string, image: File): Promise<Activity> => {
    const formData = new FormData();
    formData.append("file", image);
    const { data } = await apiClient.put(
      `/api/activities/${id}/image`,
      formData,
    );
    return data?.data ?? data;
  },

  updateActivityImageUrl: async (
    id: string,
    imageUrl: string,
  ): Promise<Activity> => {
    const { data } = await apiClient.put(`/api/activities/${id}/image-url`, {
      imageUrl,
    });
    return data?.data ?? data;
  },

  toggleActivityStatus: async (id: string): Promise<Activity> => {
    const { data } = await apiClient.patch(
      `/api/activities/${id}/toggle-status`,
    );
    return data?.data ?? data;
  },
};
