// contexts/CalendarContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAppContext } from "./AppContext";
import { apiClient } from "src/app/lib/apiClient";

// Interfaces
export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  capacity: number;
  status: string;
  color?: string;
  image?: string;
}

export interface Turn {
  id: string;
  activityId: string;
  activity?: Activity;
  date: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  status: string;
}

export interface Reservation {
  id: string;
  userId: string;
  turnId: string;
  turn?: Turn;
  status: string;
  createdAt: string;
}

interface CalendarContextType {
  // Data
  activities: Activity[];
  turns: Turn[];
  reservations: Reservation[];

  // State
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  viewMode: "day" | "week" | "month";

  // Setters
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: "day" | "week" | "month") => void;

  // Methods
  fetchActivities: () => Promise<void>;
  fetchTurns: (filters?: {
    activityId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => Promise<void>;
  fetchReservations: () => Promise<void>;
  createReservation: (turnId: string) => Promise<Reservation>;
  createManualReservation: (data: { userId: string; activityId: string; date: string; startTime: string; endTime: string }) => Promise<Reservation>;
  modifyReservation: (reservationId: string, data: { activityId: string; date: string; startTime: string; endTime: string }) => Promise<void>;
  cancelReservation: (reservationId: string, reason?: string) => Promise<void>;
  refetchAll: () => Promise<void>;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAppContext();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");

  // Fetch activities (public)
  const fetchActivities = useCallback(async () => {
    try {
      console.log("📡 Fetching activities...");
      const { data } = await apiClient.get("/api/activities/active");

      const colors = [
        "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#14b8a6",
        "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
      ];

      const withColors = data.map((activity: Activity, index: number) => ({
        ...activity,
        color: colors[index % colors.length],
      }));

      setActivities(withColors);
      console.log("✅ Activities loaded:", withColors.length);
    } catch (err: any) {
      console.error("❌ Error fetching activities:", err);
      setError(err.message);
      setActivities([]);
    }
  }, []);

  // Fetch turns (public)
  const fetchTurns = useCallback(async (filters?: {
    activityId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    try {
      console.log("📡 Fetching turns...", filters);

      const params: Record<string, string> = {};
      if (filters?.activityId) params.activityId = filters.activityId;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.status) params.status = filters.status;

      const { data } = await apiClient.get("/api/turns", { params: Object.keys(params).length ? params : undefined });
      const list = Array.isArray(data) ? data : (data?.data || data?.turns || []);
      setTurns(list);
      console.log("✅ Turns loaded:", list.length);
    } catch (err: any) {
      console.error("❌ Error fetching turns:", err);
      setError(err.message);
      setTurns([]);
    }
  }, []);

  // Fetch reservations (requires auth) - GET /api/reservations/me
  const fetchReservations = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log("⚠️ Not authenticated, skipping reservations fetch");
      return;
    }

    try {
      console.log("📡 Fetching my reservations...");
      const { data } = await apiClient.get("/api/reservations/me");
      const list = Array.isArray(data) ? data : (data?.data || data?.reservations || []);
      setReservations(list);
      console.log("✅ Reservations loaded:", list.length);
    } catch (err: any) {
      console.error("❌ Error fetching reservations:", err);
      setError(err.message);
      setReservations([]);
    }
  }, [isAuthenticated, token]);

  // Create reservation (requires auth)
  const createReservation = async (turnId: string): Promise<Reservation> => {
    if (!token) throw new Error("No autenticado");

    try {
      console.log("📝 Creating reservation for turn:", turnId);

      const { data } = await apiClient.post("/api/reservations", { turnId });
      console.log("✅ Reservation created:", data.id);

      // Refresh reservations
      await fetchReservations();

      return data;
    } catch (err: any) {
      console.error("❌ Error creating reservation:", err);
      setError(err.message);
      throw err;
    }
  };

  // Create manual reservation (admin: find turn by activity+date+time, then create for current user; backend does not support userId)
  const createManualReservation = async (formData: { userId: string; activityId: string; date: string; startTime: string; endTime: string }): Promise<Reservation> => {
    const { data } = await apiClient.get("/api/turns", {
      params: { activityId: formData.activityId, startDate: formData.date, endDate: formData.date },
    });
    const list = Array.isArray(data) ? data : (data?.data || data?.turns || []);
    const turn = list.find(
      (t: any) =>
        String(t.date).startsWith(formData.date) &&
        t.startTime === formData.startTime &&
        t.endTime === formData.endTime
    );
    if (!turn) throw new Error("No se encontró un turno para la fecha y horario seleccionados.");
    return createReservation(turn.id);
  };

  // Modify reservation: cancel current and create in new turn (backend has no PATCH; new reservation is for current user)
  const modifyReservation = async (
    reservationId: string,
    formData: { activityId: string; date: string; startTime: string; endTime: string }
  ): Promise<void> => {
    const { data } = await apiClient.get("/api/turns", {
      params: { activityId: formData.activityId, startDate: formData.date, endDate: formData.date },
    });
    const list = Array.isArray(data) ? data : (data?.data || data?.turns || []);
    const turn = list.find(
      (t: any) =>
        String(t.date).startsWith(formData.date) &&
        t.startTime === formData.startTime &&
        t.endTime === formData.endTime
    );
    if (!turn) throw new Error("No se encontró un turno para la fecha y horario seleccionados.");
    await cancelReservation(reservationId);
    await createReservation(turn.id);
  };

  // Cancel reservation (requires auth)
  const cancelReservation = async (reservationId: string, reason?: string) => {
    if (!token) throw new Error("No autenticado");

    try {
      console.log("❌ Canceling reservation:", reservationId);

      await apiClient.put(`/api/reservations/${reservationId}/cancel`, { reason });

      console.log("✅ Reservation canceled");

      // Refresh reservations
      await fetchReservations();
    } catch (err: any) {
      console.error("❌ Error canceling reservation:", err);
      setError(err.message);
      throw err;
    }
  };

  // Refetch all data
  const refetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const startDate = new Date(selectedDate);
    startDate.setDate(1);
    const endDate = new Date(selectedDate);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    try {
      await Promise.all([
        fetchActivities(),
        fetchTurns({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
        isAuthenticated ? fetchReservations() : Promise.resolve(),
      ]);
    } catch (err: any) {
      console.error("❌ Error refetching:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isAuthenticated, fetchActivities, fetchTurns, fetchReservations]);

  const goToNextMonth = () => {
    setSelectedDate((prevDate) => {
      const nextMonth = new Date(prevDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    });
  };

  const goToPreviousMonth = () => {
    setSelectedDate((prevDate) => {
      const prevMonth = new Date(prevDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };

  // Initial load
  useEffect(() => {
    refetchAll();
  }, [isAuthenticated, token, refetchAll]);

  // Auto-refresh reservations when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    } else {
      setReservations([]);
    }
  }, [isAuthenticated, token, fetchReservations]);

  return (
    <CalendarContext.Provider
      value={{
        activities,
        turns,
        reservations,
        loading,
        error,
        selectedDate,
        viewMode,
        setSelectedDate,
        setViewMode,
        fetchActivities,
        fetchTurns,
        fetchReservations,
        createReservation,
        createManualReservation,
        modifyReservation,
        cancelReservation,
        refetchAll,
        goToNextMonth,
        goToPreviousMonth,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar debe usarse dentro de CalendarProvider");
  }
  return context;
}
