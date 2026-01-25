export interface Turn {
  id: string;
  activityId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  availableSpots: number;
  status?: string;
  isFreeTrial?: boolean;
  activity?: {
    id: string;
    name: string;
    duration: number;
  };
  createdAt?: string;
  updatedAt?: string;
}
