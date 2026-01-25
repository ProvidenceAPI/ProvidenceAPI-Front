// src/app/lib/paymentService.ts
import { apiClient } from "./apiClient";
import { Payment } from "src/interfaces/Payments";

const isValidUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
export const paymentService = {
  createPaymentPreference: async (activityId: string): Promise<string> => {
    try {
      const { data: paymentResponse } = await apiClient.post("/api/payments", {
        activityId,
      });
      const initPoint =
        paymentResponse.initPoint ||
        paymentResponse.init_point ||
        paymentResponse.data?.initPoint ||
        paymentResponse.data?.init_point;
      if (!initPoint) {
        throw new Error(
          "No se pudo obtener el link de pago. Respuesta inesperada del servidor.",
        );
      }
      return initPoint;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(
          "Este turno ya tiene una reserva activa. " +
            "Por favor, selecciona otro horario o contacta al administrador si crees que es un error.",
        );
      }
      if (error.response?.status === 400) {
        const errorMsg =
          error.response?.data?.message || error.response?.data?.error;
        throw new Error(errorMsg || "Datos inválidos para crear la reserva");
      }
      if (error.response?.status === 401) {
        throw new Error(
          "Sesión expirada. Por favor, inicia sesión nuevamente.",
        );
      }
      if (error.response?.status === 403) {
        throw new Error("No tienes permiso para realizar esta acción.");
      }
      if (error.response?.status === 404) {
        throw new Error("El turno o actividad no existe.");
      }
      throw new Error(
        error.message ||
          "Error al procesar el pago. Por favor intenta nuevamente.",
      );
    }
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    try {
      const response = await apiClient.get("/api/payments/me");
      const rawData: any = response.data;
      const payments = rawData.data || rawData.payments || rawData;
      if (!Array.isArray(payments)) {
        return [];
      }
      return payments;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return [];
      }
      return [];
    }
  },

  getPaymentStatus: async (paymentId: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`/api/payments/${paymentId}`);
      return data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al obtener el estado del pago",
      );
    }
  },
};

export { isValidUUID };
