// src/lib/reservationService.ts - VERSIÓN UNIFICADA COMPLETA

import { apiClient } from './apiClient';
import { Turn } from 'src/interfaces/Turn';
import { Reservation } from 'src/interfaces/Reservation';
import { ReservationRequest } from 'src/interfaces/ReservationRequest';
import { Activity } from 'src/interfaces/Activity';

// Helper para normalizar respuestas de arrays
const normalizeArrayResponse = (data: any, arrayKey?: string): any[] => {
  if (Array.isArray(data)) return data;
  if (arrayKey && data?.[arrayKey] && Array.isArray(data[arrayKey])) return data[arrayKey];

  const commonKeys = ['data', 'reservations', 'activities', 'turns', 'items', 'results'];
  for (const key of commonKeys) {
    if (data?.[key] && Array.isArray(data[key])) return data[key];
  }

  console.warn('⚠️ No se pudo normalizar respuesta a array:', data);
  return [];
};

export const reservationService = {
  // ==================== ACTIVITIES ====================

  /**
   * GET /api/activities - Obtener todas las actividades
   */
  getActivities: async (): Promise<Activity[]> => {
    try {
      console.log('📡 GET /api/activities');
      const response = await apiClient.get('/api/activities');
      return normalizeArrayResponse(response.data, 'data');
    } catch (error) {
      console.error('❌ Error obteniendo actividades:', error);
      throw error;
    }
  },

  /**
   * GET /api/activities/active - Obtener solo actividades activas
   */
  getActiveActivities: async (): Promise<Activity[]> => {
    try {
      console.log('📡 GET /api/activities/active');
      const response = await apiClient.get('/api/activities/active');
      return normalizeArrayResponse(response.data, 'data');
    } catch (error) {
      console.error('❌ Error obteniendo actividades activas:', error);
      throw error;
    }
  },

  // ==================== TURNS ====================

  /**
   * GET /api/turns - Obtener todos los turnos con filtros opcionales
   */
  getTurns: async (filters?: {
    activityId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Turn[]> => {
    try {
      console.log('📡 GET /api/turns con filtros:', filters);
      const response = await apiClient.get('/api/turns', { params: filters });
      return normalizeArrayResponse(response.data, 'data');
    } catch (error) {
      console.error('❌ Error obteniendo turnos:', error);
      throw error;
    }
  },

  /**
   * GET /api/turns/available/{activityId} - Turnos disponibles para una actividad
   */
  getAvailableTurns: async (activityId: string | number): Promise<Turn[]> => {
    try {
      console.log('🔍 GET /api/turns/available/' + activityId);
      
      const response = await apiClient.get(`/api/turns/available/${activityId}`);
      console.log('✅ Respuesta completa:', response);
      
      const turns = normalizeArrayResponse(response.data, 'data');
      console.log('✅ Total turnos encontrados:', turns.length);
      
      return turns;
    } catch (error: any) {
      console.error('❌ Error obteniendo turnos disponibles:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Verificar disponibilidad para un turno (activityId + date + startTime + endTime)
   */
  checkAvailability: async (params: {
    activityId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<{ available: boolean; availableSlots: number; maxParticipants: number }> => {
    try {
      const { data } = await apiClient.get("/api/turns", {
        params: { activityId: params.activityId, startDate: params.date, endDate: params.date },
      });
      const turns = normalizeArrayResponse(data, "data");
      const t = turns.find(
        (t: any) =>
          String(t.date).startsWith(params.date) &&
          t.startTime === params.startTime &&
          t.endTime === params.endTime
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

  /**
   * GET /api/turns/{id} - Obtener turno por ID
   */
  getTurnById: async (id: string): Promise<Turn> => {
    try {
      console.log(`📡 GET /api/turns/${id}`);
      const response = await apiClient.get(`/api/turns/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error obteniendo turno:', error);
      throw error;
    }
  },

  /**
   * POST /api/turns - Crear turno manualmente (Admin)
   */
  createTurn: async (data: {
    activityId: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity?: number;
  }): Promise<Turn> => {
    try {
      console.log('📡 POST /api/turns', data);
      const response = await apiClient.post('/api/turns', data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error creando turno:', error);
      throw error;
    }
  },

  /**
   * POST /api/turns/generate - Generar turnos automáticamente (Admin)
   */
  generateTurns: async (data: {
    activityId: string;
    startDate: string;
    endDate: string;
  }): Promise<Turn[]> => {
    try {
      console.log('📡 POST /api/turns/generate', data);
      const response = await apiClient.post('/api/turns/generate', data);
      return normalizeArrayResponse(response.data, 'data');
    } catch (error) {
      console.error('❌ Error generando turnos:', error);
      throw error;
    }
  },

  /**
   * PUT /api/turns/{id} - Actualizar turno (Admin)
   */
  updateTurn: async (id: string, data: Partial<Turn>): Promise<Turn> => {
    try {
      console.log(`📡 PUT /api/turns/${id}`, data);
      const response = await apiClient.put(`/api/turns/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error actualizando turno:', error);
      throw error;
    }
  },

  /**
   * DELETE /api/turns/{id} - Eliminar turno (SuperAdmin)
   */
  deleteTurn: async (id: string): Promise<void> => {
    try {
      console.log(`📡 DELETE /api/turns/${id}`);
      await apiClient.delete(`/api/turns/${id}`);
    } catch (error) {
      console.error('❌ Error eliminando turno:', error);
      throw error;
    }
  },

  /**
   * PATCH /api/turns/{id}/cancel - Cancelar turno (Admin)
   */
  cancelTurn: async (id: string): Promise<Turn> => {
    try {
      console.log(`📡 PATCH /api/turns/${id}/cancel`);
      const response = await apiClient.patch(`/api/turns/${id}/cancel`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error cancelando turno:', error);
      throw error;
    }
  },

  // ==================== RESERVATIONS ====================

  /**
   * POST /api/reservations - Crear reserva para un turno
   */
  createReservation: async (reservationData: ReservationRequest): Promise<Reservation> => {
    try {
      console.log('📡 POST /api/reservations', reservationData);
      
      const response = await apiClient.post('/api/reservations', reservationData);
      const reservation = response.data.data || response.data;
      
      console.log('✅ Reserva creada:', reservation);
      return reservation;
    } catch (error: any) {
      console.error('❌ Error creando reserva:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      throw error;
    }
  },

  /**
   * GET /api/reservations/me - Mis reservas (Usuario)
   */
  getUserReservations: async (): Promise<Reservation[]> => {
    try {
      // Verificar que haya token
      const token = typeof window !== 'undefined' ? localStorage.getItem('providence_token') : null;
      console.log('🔑 Token disponible:', token ? 'SÍ (primeros 20 chars): ' + token.substring(0, 20) + '...' : 'NO');
      
      if (!token) {
        console.error('❌ No hay token - redirigiendo a login');
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }
      
      console.log('📡 GET /api/reservations/me');
      
      const response = await apiClient.get('/api/reservations/me');
      console.log('✅ Respuesta de reservas:', response);
      
      const reservations = normalizeArrayResponse(response.data, 'data');
      console.log('✅ Total reservas del usuario:', reservations.length);
      
      return reservations;
    } catch (error: any) {
      console.error('❌ Error obteniendo reservas del usuario:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      
      // Si es 403, limpiar y redirigir
      if (error.response?.status === 403) {
        console.error('🔐 Token inválido - limpiando sesión');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('providence_token');
          localStorage.removeItem('providence_user');
        }
      }
      
      throw error;
    }
  },

  /**
   * GET /api/reservations/me - Alias de getUserReservations (para compatibilidad)
   */
  getMyReservations: async (): Promise<Reservation[]> => {
    return reservationService.getUserReservations();
  },

  /**
   * GET /api/reservations - Todas las reservas (Admin)
   */
  getAllReservations: async (): Promise<Reservation[]> => {
    try {
      console.log('📡 GET /api/reservations (Admin)');
      
      const response = await apiClient.get('/api/reservations');
      const reservations = normalizeArrayResponse(response.data, 'data');
      
      console.log('✅ Total reservas (admin):', reservations.length);
      return reservations;
    } catch (error: any) {
      console.error('❌ Error obteniendo todas las reservas:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      throw error;
    }
  },

  /**
   * PUT /api/reservations/{id}/cancel - Cancelar mi reserva
   */
  cancelReservation: async (reservationId: string | number): Promise<void> => {
    try {
      console.log('🗑️ PUT /api/reservations/' + reservationId + '/cancel');
      
      await apiClient.put(`/api/reservations/${reservationId}/cancel`);
      console.log('✅ Reserva cancelada exitosamente');
    } catch (error: any) {
      console.error('❌ Error cancelando reserva:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      throw error;
    }
  },

  /**
   * PATCH /api/reservations/turn/{turnId}/cancel - Cancelar turno y notificar usuarios (Admin)
   */
  cancelTurnAndNotify: async (turnId: string): Promise<void> => {
    try {
      console.log(`📡 PATCH /api/reservations/turn/${turnId}/cancel`);
      
      await apiClient.patch(`/api/reservations/turn/${turnId}/cancel`);
      console.log('✅ Turno cancelado y usuarios notificados');
    } catch (error) {
      console.error('❌ Error cancelando turno y notificando:', error);
      throw error;
    }
  },

  /**
   * Verificar si el usuario tiene clase gratis disponible
   */
  checkFreeReservation: async (): Promise<boolean> => {
    try {
      const reservations = await reservationService.getUserReservations();
      // Si no tiene reservas, tiene la clase gratis disponible
      const hasFree = reservations.length === 0;
      console.log('🎁 Tiene clase gratis disponible:', hasFree);
      return hasFree;
    } catch (error) {
      console.error('❌ Error verificando clase gratis:', error);
      return false;
    }
  },
};