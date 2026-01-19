import { Activity } from "./Activity";
import { Turn } from "./Turn";

export interface ScheduleListProps {
  activity: Activity;
  turns: Turn[];
  isAuthenticated: boolean;
  userId?: string;
  onReserve: (turnId: string) => Promise<void>;
  userHasFreeReservation: boolean;
}