export { activityService, type CreateActivityDTO, type UpdateActivityDTO } from './ActivityService';
export type { Activity } from 'src/interfaces/Activity';
export { reservationService } from './ReservationService';
export { paymentService } from './paymentService';
export { apiClient, getAuthHeaders } from './apiClient';
export { userService, type User } from './userService';

export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};