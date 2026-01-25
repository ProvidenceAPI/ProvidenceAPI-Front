import { apiClient } from "./apiClient";
import { Turn } from "src/interfaces/Turn";
import { Reservation } from "src/interfaces/Reservation";
import { ReservationRequest } from "src/interfaces/ReservationRequest";
import { Activity } from "src/interfaces/Activity";

const normalizeArrayResponse = (data: any, arrayKey?: string): any[] => {
  if (Array.isArray(data)) return data;
  if (arrayKey && data?.[arrayKey] && Array.isArray(data[arrayKey]))
    return data[arrayKey];

  const commonKeys = [
    "data",
    "reservations",
    "activities",
    "turns",
    "items",
    "results",
  ];
  for (const key of commonKeys) {
    if (data?.[key] && Array.isArray(data[key])) return data[key];
  }
  return [];
};

export const reservationService = {
  getActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get("/api/activities");
    return normalizeArrayResponse(response.data, "data");
  },

  getActiveActivities: async (): Promise<Activity[]> => {
    const response = await apiClient.get("/api/activities/active");
    return normalizeArrayResponse(response.data, "data");
  },

  getTurns: async (filters?: {
    activityId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Turn[]> => {
    const response = await apiClient.get("/api/turns", { params: filters });
    return normalizeArrayResponse(response.data, "data");
  },

  getAvailableTurns: async (activityId: string | number): Promise<Turn[]> => {
    const response = await apiClient.get(`/api/turns/available/${activityId}`);
    const turns = normalizeArrayResponse(response.data, "data");
    return turns;
  },

  checkAvailability: async (params: {
    activityId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<{
    available: boolean;
    availableSlots: number;
    maxParticipants: number;
  }> => {
    try {
      const { data } = await apiClient.get("/api/turns", {
        params: {
          activityId: params.activityId,
          startDate: params.date,
          endDate: params.date,
        },
      });
      const turns = normalizeArrayResponse(data, "data");
      const t = turns.find(
        (t: any) =>
          String(t.date).startsWith(params.date) &&
          t.startTime === params.startTime &&
          t.endTime === params.endTime,
      );
      const slots = (t as any)?.availableSpots ?? 0;
      const cap = (t as any)?.capacity ?? 0;
      return {
        available: slots > 0,
        availableSlots: slots,
        maxParticipants: cap || slots,
      };
    } catch {
      return { available: false, availableSlots: 0, maxParticipants: 0 };
    }
  },

  getTurnById: async (id: string): Promise<Turn> => {
    const response = await apiClient.get(`/api/turns/${id}`);
    return response.data.data || response.data;
  },

  createTurn: async (data: {
    activityId: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity?: number;
  }): Promise<Turn> => {
    try {
      const response = await apiClient.post("/api/turns", data);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response) {
        throw {
          statusCode: error.response.status,
          message: error.response.data?.message || error.message,
          originalError: error,
        };
      }
      throw error;
    }
  },

  generateTurns: async (data: {
    activityId: string;
    startDate: string;
    endDate: string;
  }): Promise<Turn[]> => {
    const response = await apiClient.post("/api/turns/generate", data);
    return normalizeArrayResponse(response.data, "data");
  },

  updateTurn: async (id: string, data: Partial<Turn>): Promise<Turn> => {
    const response = await apiClient.put(`/api/turns/${id}`, data);
    return response.data.data || response.data;
  },

  deleteTurn: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/turns/${id}`);
  },

  cancelTurn: async (id: string): Promise<Turn> => {
    const response = await apiClient.patch(`/api/turns/${id}/cancel`);
    return response.data.data || response.data;
  },

  createReservation: async (
    reservationData: ReservationRequest,
  ): Promise<Reservation> => {
    try {
      const response = await apiClient.post(
        "/api/reservations",
        reservationData,
      );
      const reservation = response.data.data || response.data;
      return reservation;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        throw {
          statusCode: status,
          message: message,
          originalError: error,
        };
      }
      throw error;
    }
  },

  getUserReservations: async (): Promise<Reservation[]> => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("providence_token")
          : null;
      if (!token) {
        throw new Error(
          "No hay token de autenticación. Por favor, inicia sesión.",
        );
      }
      const response = await apiClient.get("/api/reservations/me");
      const reservations = normalizeArrayResponse(response.data, "data");
      return reservations;
    } catch (error: any) {
      if (error.response?.status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("providence_token");
          localStorage.removeItem("providence_user");
        }
      }
      throw error;
    }
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    return reservationService.getUserReservations();
  },

  getAllReservations: async (): Promise<Reservation[]> => {
    try {
      const response = await apiClient.get("/api/reservations");
      const reservations = normalizeArrayResponse(response.data, "data");
      return reservations;
    } catch (error: any) {
      throw error;
    }
  },

  cancelReservation: async (reservationId: string | number): Promise<void> => {
    try {
      await apiClient.put(`/api/reservations/${reservationId}/cancel`);
    } catch (error: any) {
      throw error;
    }
  },

  cancelTurnAndNotify: async (turnId: string): Promise<void> => {
    await apiClient.patch(`/api/reservations/turn/${turnId}/cancel`);
  },

  checkFreeReservation: async (): Promise<boolean> => {
    try {
      const reservations = await reservationService.getUserReservations();
      const hasFree = reservations.length === 0;
      return hasFree;
    } catch (error) {
      return false;
    }
  },
};
