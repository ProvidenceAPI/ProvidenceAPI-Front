export interface Turn {
  id: string;
  activityId: string;
  date: string;
  startTime: string;
  capacity: number;
  availableSpots: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
