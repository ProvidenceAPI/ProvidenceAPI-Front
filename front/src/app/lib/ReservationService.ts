
import { apiClient } from './apiClient';
import { Turn } from 'src/interfaces/Turn';
import { Reservation } from 'src/interfaces/Reservation';
import { ReservationRequest } from 'src/interfaces/ReservationRequest';

export const reservationService = {
  getAvailableTurns: async (activityId: string | number): Promise<Turn[]> => {
    try {
      console.log('🔍 Buscando turnos para actividad:', activityId);
      
      const response = await apiClient.get(`/api/turns/available/${activityId}`);
      console.log('✅ Respuesta completa de turnos:', response);
      
      const rawData: any = response.data;
      const turns = rawData.data || rawData;
      
      console.log('✅ Total turnos encontrados:', Array.isArray(turns) ? turns.length : 0);
      
      return Array.isArray(turns) ? turns : [];
    } catch (error) {
      console.error('❌ Error obteniendo turnos:', error);
      throw error;
    }
  },

  createReservation: async (reservationData: ReservationRequest): Promise<Reservation> => {
    try {
      const response = await apiClient.post('/api/reservations', reservationData);
      const rawData: any = response.data;
      return rawData.data || rawData;
    } catch (error) {
      console.error('❌ Error creando reserva:', error);
      throw error;
    }
  },


  getUserReservations: async (): Promise<Reservation[]> => {
    try {
      console.log('📡 Obteniendo reservas del usuario...');
      

      const response = await apiClient.get('/api/reservations/me');
      
      console.log('✅ Respuesta de reservas:', response);
      
      const rawData: any = response.data;
      const reservations = rawData.data || rawData;
      
      console.log('✅ Total reservas:', Array.isArray(reservations) ? reservations.length : 0);
      
      return Array.isArray(reservations) ? reservations : [];
    } catch (error: any) {
      console.error('❌ Error obteniendo reservas:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      throw error;
    }
  },

  cancelReservation: async (reservationId: string | number): Promise<void> => {
    try {
      console.log('🗑️ Cancelando reserva:', reservationId);
      await apiClient.patch(`/api/reservations/${reservationId}/cancel`);
      console.log('✅ Reserva cancelada exitosamente');
    } catch (error) {
      console.error('❌ Error cancelando reserva:', error);
      throw error;
    }
  },

  checkFreeReservation: async (): Promise<boolean> => {
    try {
      const reservations = await reservationService.getUserReservations();
      return reservations.length === 0;
    } catch {
      return false;
    }
  },
};