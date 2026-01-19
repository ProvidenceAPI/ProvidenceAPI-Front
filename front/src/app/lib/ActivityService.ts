import { apiClient } from './apiClient';
import { Activity } from 'src/interfaces/Activity';


interface ApiResponse<T> {
  data: T;
  meta?: any;
}

export const activityService = {
 
  getAllActivities: async (): Promise<Activity[]> => {
    try {
      const response = await apiClient.get('/api/activities');
      console.log('✅ Respuesta completa:', response);
      console.log('✅ response.data:', response.data);
      
     
      const rawData: any = response.data;
      const activities = rawData.data || rawData;
      console.log('✅ Actividades finales:', activities);
      
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      console.error('❌ Error obteniendo todas las actividades:', error);
      throw error;
    }
  },


  getActiveActivities: async (): Promise<Activity[]> => {
    try {
      const response = await apiClient.get('/api/activities/active');
      const rawData: any = response.data;
      const activities = rawData.data || rawData;
      console.log('✅ Actividades activas obtenidas:', Array.isArray(activities) ? activities.length : 0);
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      console.error('❌ Error obteniendo actividades activas:', error);
      throw error;
    }
  },


  getActivityById: async (activityId: string | number): Promise<Activity> => {
    try {
      const response = await apiClient.get(`/api/activities/${activityId}`);
      const rawData: any = response.data;
      const activity = rawData.data || rawData;
      console.log('✅ Actividad obtenida:', activity);
      return activity;
    } catch (error) {
      console.error('❌ Error obteniendo actividad:', error);
      throw error;
    }
  },
};