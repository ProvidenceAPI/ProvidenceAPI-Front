export interface Turn {
  id: string; 
  activityId: string;
  date: string; 
  time: string; 
  capacity: number;
  availableSpots: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}