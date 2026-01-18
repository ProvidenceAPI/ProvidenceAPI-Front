export { activityService } from './ActivityService';
export { reservationService } from './ReservationService';
export { paymentService } from './paymentService';
export { apiClient, getAuthHeaders } from './apiClient';

export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};