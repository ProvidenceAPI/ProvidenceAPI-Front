export interface Reservation {
  id: string;
  activityDate: string;
  startTime: string;
  endTime?: string;
  status: string;
  activityId: string;
  turnId: string;

  activity?: {
    id: string;
    name: string;
    capacity: number;
  };

  turn?: {
    id: string;
    availableSpots: number;
    isFreeTrial: boolean;
  };
}
