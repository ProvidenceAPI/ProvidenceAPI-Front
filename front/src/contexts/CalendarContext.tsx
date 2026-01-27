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
import {
  broadcastReservationUpdate,
  reservationChannel,
  turnChannel,
  activityChannel,
} from "src/utils/broadcastChannel";
import { endOfMonth, format, startOfMonth } from "date-fns";

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  capacity: number;
  status: string;
  schedule?: string[];
  color?: string;
  image?: string;
  imageUrl?: string;
  trainer?: string;
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
  activities: Activity[];
  turns: Turn[];
  reservations: Reservation[];

  loading: boolean;
  error: string | null;
  selectedDate: Date;
  viewMode: "day" | "week" | "month";

  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: "day" | "week" | "month") => void;

  fetchActivities: () => Promise<void>;
  fetchTurns: (filters?: {
    activityId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => Promise<void>;
  fetchReservations: () => Promise<void>;
  createReservation: (turnId: string) => Promise<Reservation>;
  createManualReservation: (data: {
    userId: string;
    activityId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => Promise<Reservation>;
  modifyReservation: (
    reservationId: string,
    data: {
      activityId: string;
      date: string;
      startTime: string;
      endTime: string;
    },
  ) => Promise<void>;
  cancelReservation: (reservationId: string, reason?: string) => Promise<void>;
  refetchAll: () => Promise<void>;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);
const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
] as const;

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAppContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [actionLoading, setActionLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<{ [key: string]: number }>({});

  const fetchActivities = useCallback(async () => {
    const now = Date.now();
    if (lastFetch.activities && now - lastFetch.activities < 2000) {
      return;
    }
    try {
      const { data } = await apiClient.get("/api/activities/active");
      const withColors = data.map((activity: Activity, index: number) => ({
        ...activity,
        color: colors[index % colors.length],
      }));
      setActivities(withColors);
      setLastFetch((prev) => ({ ...prev, activities: now }));
    } catch (err: any) {
      setError(err.message);
      setActivities([]);
      console.error("Error fetching activities:", err);
    }
  }, [lastFetch]);

  const fetchTurns = useCallback(
    async (filters?: {
      activityId?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }) => {
      try {
        let url = "/api/turns";
        const params: string[] = [];
        if (filters?.activityId) {
          params.push(`activityId=${encodeURIComponent(filters.activityId)}`);
        }
        if (filters?.startDate) {
          params.push(`startDate=${encodeURIComponent(filters.startDate)}`);
        }
        if (filters?.endDate) {
          params.push(`endDate=${encodeURIComponent(filters.endDate)}`);
        }
        if (filters?.status) {
          params.push(`status=${encodeURIComponent(filters.status)}`);
        }
        if (params.length > 0) {
          url += "?" + params.join("&");
        }
        const { data } = await apiClient.get(url);
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.turns || [];
        setTurns(list);
      } catch (err: any) {
        console.error("❌ Error en fetchTurns:", err);
        setError(err.message);
        setTurns([]);
      }
    },
    [],
  );

  const fetchReservations = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setReservations([]);
      return;
    }
    try {
      const { data } = await apiClient.get("/api/reservations/me");
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.reservations || [];
      setReservations(list);
    } catch (err: any) {
      console.error("Error fetching reservations:", err);
      setReservations([]);
    }
  }, [isAuthenticated, token]);

  const createReservation = async (turnId: string): Promise<Reservation> => {
    if (!token) throw new Error("No autenticado");
    try {
      const { data } = await apiClient.post("/api/reservations", { turnId });
      broadcastReservationUpdate("created", data.id);
      await fetchReservations();
      await fetchTurns();
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  const createManualReservation = async (formData: {
    userId: string;
    activityId: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<Reservation> => {
    const { data } = await apiClient.get("/api/turns", {
      params: {
        activityId: formData.activityId,
        startDate: formData.date,
        endDate: formData.date,
      },
    });
    const list = Array.isArray(data) ? data : data?.data || data?.turns || [];
    const turn = list.find(
      (t: any) =>
        String(t.date).startsWith(formData.date) &&
        t.startTime === formData.startTime &&
        t.endTime === formData.endTime,
    );
    if (!turn)
      throw new Error(
        "No se encontró un turno para la fecha y horario seleccionados.",
      );
    return createReservation(turn.id);
  };

  const modifyReservation = async (
    reservationId: string,
    formData: {
      activityId: string;
      date: string;
      startTime: string;
      endTime: string;
    },
  ): Promise<void> => {
    const { data } = await apiClient.get("/api/turns", {
      params: {
        activityId: formData.activityId,
        startDate: formData.date,
        endDate: formData.date,
      },
    });
    const list = Array.isArray(data) ? data : data?.data || data?.turns || [];
    const turn = list.find(
      (t: any) =>
        String(t.date).split("T")[0] === formData.date &&
        t.startTime.substring(0, 5) === formData.startTime &&
        t.endTime.substring(0, 5) === formData.endTime,
    );
    if (!turn)
      throw new Error(
        "No se encontró un turno para la fecha y horario seleccionados.",
      );
    let newReservation;
    try {
      newReservation = await createReservation(turn.id);
    } catch (err) {
      throw new Error(
        "No se pudo crear la nueva reserva. Tu reserva original se mantiene.",
      );
    }
    try {
      await cancelReservation(reservationId, "Modificación de reserva");
    } catch (err) {
      console.error(
        "Advertencia: Nueva reserva creada pero no se pudo cancelar la original",
      );
    }
    broadcastReservationUpdate("modified", reservationId);
    await fetchReservations();
  };

  const cancelReservation = async (reservationId: string, reason?: string) => {
    if (!token) throw new Error("No autenticado");
    try {
      await apiClient.put(`/api/reservations/${reservationId}/cancel`, {
        reason,
      });
      broadcastReservationUpdate("cancelled", reservationId);
      await fetchReservations();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    try {
      await Promise.all([
        fetchActivities(),
        fetchTurns({
          startDate: format(monthStart, "yyyy-MM-dd"),
          endDate: format(monthEnd, "yyyy-MM-dd"),
        }),
        isAuthenticated ? fetchReservations() : Promise.resolve(),
      ]);
    } catch (err: any) {
      console.error("❌ Error en refetchAll:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    selectedDate,
    isAuthenticated,
    fetchActivities,
    fetchTurns,
    fetchReservations,
  ]);

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

  useEffect(() => {
    refetchAll();
  }, [selectedDate, refetchAll]);

  useEffect(() => {
    const handleActivityChange = (event: MessageEvent) => {
      fetchActivities();
    };

    const handleTurnChange = (event: MessageEvent) => {
      refetchAll();
    };

    const handleReservationChange = (event: MessageEvent) => {
      if (isAuthenticated) {
        fetchReservations();
      }
    };

    activityChannel.addEventListener("message", handleActivityChange);
    turnChannel.addEventListener("message", handleTurnChange);
    reservationChannel.addEventListener("message", handleReservationChange);

    return () => {
      activityChannel.removeEventListener("message", handleActivityChange);
      turnChannel.removeEventListener("message", handleTurnChange);
      reservationChannel.removeEventListener(
        "message",
        handleReservationChange,
      );
    };
  }, [fetchActivities, fetchTurns, fetchReservations, isAuthenticated]);

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
