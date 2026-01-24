import { Turn } from "./Turn";

export interface Reservation {
  id: string;
  activityDate: string;
  startTime: string;
  endTime?: string;
  status: string;
  activityId: string;
  turnId: string;
  isFreeTrial?: boolean;

  activity?: {
    id: string;
    name: string;
    capacity: number;
  };

  turn?: Turn;

  user: {
    id: string;
    name: string;
    email: string;
  };
}
