import { Activity } from "./Activity";
import { Turn } from "./Turn";

export interface Reservation {
  id: string; 
  userId: string;
  turnId: string;
  activityId: string;
  activityName: string; 
  date: string; 
  hour: string; 
  status: 'active' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  isFree?: boolean; 
  isFreeReservation?: boolean; 
  isPaid?: boolean; 
  createdAt: string;
  updatedAt: string;
  
  turn?: Turn;
  activity?: Activity;
}