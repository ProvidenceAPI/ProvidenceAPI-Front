"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAppContext } from "src/contexts/AppContext";
import ScheduleList from "src/components/ScheduleList";
import { Turn } from "src/interfaces/Turn";
import { ReservationRequest } from "src/interfaces/ReservationRequest";
import { Activity } from "src/interfaces/Activity";
import { reservationService, activityService } from "src/app/lib";

const ACTIVITY_SLUG_MAP: Record<string, string> = {
  crossfit: "CrossFit",
  hiit: "HIIT",
  funcional: "Funcional",
  "open-box": "Open Box",
  "yoga-matutino": "Yoga Matutino",
  yoga: "Yoga",
  gap: "GAP",
  musculacion: "Musculacion",
  pilates: "Pilates",
  zumba: "Zumba",
  spinning: "Spinning",
};

export default function ActivityPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAppContext();
  const activitySlug = params.activity as string;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loadingTurns, setLoadingTurns] = useState(false);
  const [userHasFreeReservation, setUserHasFreeReservation] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const loadActivity = useCallback(async () => {
    try {
      setLoading(true);
      const activities = await activityService.getAllActivities();
      const searchName = ACTIVITY_SLUG_MAP[activitySlug.toLowerCase()];
      const foundActivity = activities.find((act: Activity) => {
        const activityName = act.name.toLowerCase().trim();
        const slugName = activitySlug.toLowerCase().trim();
        const mappedName = searchName?.toLowerCase().trim();
        return (
          activityName === slugName ||
          activityName === mappedName ||
          activityName.replace(/\s+/g, "-") === slugName ||
          activityName.replace(/\s+/g, "") === slugName.replace(/\s+/g, "")
        );
      });

      if (foundActivity) {
        setActivity(foundActivity);
      } else {
        await Swal.fire({
          title: "Actividad no encontrada",
          text: `No se pudo encontrar la actividad "${activitySlug}"`,
          icon: "error",
          confirmButtonText: "Volver",
        });
        router.push("/home");
      }
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Error al cargar la actividad",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      router.push("/home");
    } finally {
      setLoading(false);
    }
  }, [activitySlug, router]);

  const loadAvailableTurns = useCallback(async () => {
    if (!activity) return;

    setLoadingTurns(true);
    try {
      const availableTurns = await reservationService.getAvailableTurns(
        activity.id,
      );
      setTurns(availableTurns);
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: "Error al cargar los horarios disponibles",
        icon: "error",
        confirmButtonText: "Entendido",
      });
    } finally {
      setLoadingTurns(false);
    }
  }, [activity]);

  const checkUserFreeReservation = useCallback(async () => {
    if (!user?.id) return;
    try {
      const hasFree = await reservationService.checkFreeReservation();
      setUserHasFreeReservation(hasFree);
    } catch (error) {
      setUserHasFreeReservation(false);
    }
  }, [user?.id]);

  const checkActiveSubscription = useCallback(async () => {
    if (!user?.id || !activity?.id) return;

    setCheckingSubscription(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/user/${user.id}/activity/${activity.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("providence_token")}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setHasActiveSubscription(
          data?.status === "Active" || data?.status === "active",
        );
      } else {
        setHasActiveSubscription(false);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  }, [user?.id, activity?.id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (isAuthenticated && user && activity) {
      loadAvailableTurns();
      checkUserFreeReservation();
      checkActiveSubscription();
    }
  }, [
    isAuthenticated,
    user,
    activity,
    loadAvailableTurns,
    checkUserFreeReservation,
    checkActiveSubscription,
  ]);

  const handleReserve = async (turnId: string) => {
    if (!user?.id || !activity) {
      throw new Error("Debes iniciar sesión para reservar");
    }
    const reservationData: ReservationRequest = { turnId };
    await reservationService.createReservation(reservationData);
    await loadAvailableTurns();
    await checkUserFreeReservation();
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <div className="text-lg text-gray-700">Cargando actividad...</div>
        </div>
      </div>
    );
  }
  if (!activity) {
    return null;
  }
  return (
    <main className="min-h-screen bg-white">
      <div className="relative h-64 md:h-80 bg-gray-900">
        {(activity.image || activity.imageUrl) &&
        !(activity.image || activity.imageUrl).includes("ejemplo") ? (
          <Image
            src={activity.image || activity.imageUrl || ""}
            alt={activity.name}
            fill
            className="object-cover opacity-60"
            priority
            unoptimized
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-60" />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold uppercase mb-2">
              {activity.name}
            </h1>
            <p className="text-xl">PROVIDENCE FITNESS</p>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de la actividad */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">
                  {activity.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Información de la Clase
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-[#DC2626] mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Duración: {activity.duration} minutos
                    </span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-[#DC2626] mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Capacidad: {activity.capacity} personas
                    </span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-[#DC2626] mt-0.5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Cancelación: {activity.cancellationTime || 24}h antes
                    </span>
                  </div>
                  {activity.hasFreeTrial && (
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#DC2626] mt-0.5 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 font-semibold">
                        ¡Primera clase gratuita!
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {!isAuthenticated && (
                <div className="mt-8">
                  <div className="bg-[#FEFCE8] border-l-4 border-yellow-400 p-6 rounded-md">
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Inicia sesión para reservar
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Debes iniciar sesión para ver y reservar horarios
                      disponibles.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-200"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                </div>
              )}
              {isAuthenticated && (
                <div className="mt-8">
                  <ScheduleList
                    activity={activity}
                    turns={turns}
                    isAuthenticated={isAuthenticated}
                    userId={user?.id}
                    onReserve={handleReserve}
                    userHasFreeReservation={userHasFreeReservation}
                    hasActiveSubscription={hasActiveSubscription}
                  />
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Precios</h3>
                {activity.hasFreeTrial ? (
                  <div className="text-center">
                    {activity.price && (
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-gray-900">
                          $
                          {typeof activity.price === "number"
                            ? activity.price.toLocaleString("es-AR")
                            : Number(activity.price || 0).toLocaleString(
                                "es-AR",
                              )}
                        </div>
                        <div className="text-sm text-gray-600">mensual</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      $
                      {typeof activity.price === "number"
                        ? activity.price.toLocaleString("es-AR")
                        : Number(activity.price || 0).toLocaleString("es-AR")}
                    </div>
                    <div className="text-sm text-gray-600">mensual</div>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push("/mis-pagos");
                    } else {
                      router.push("/register");
                    }
                  }}
                  className="w-full bg-[#DC2626] hover:bg-[#B01C1C] text-white py-3 rounded-md font-bold uppercase tracking-wider transition-colors duration-200 mt-6"
                >
                  Inscribirse Ahora
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    📅 Horarios
                  </h3>
                </div>
                {activity.schedule && activity.schedule.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const scheduleByDay: Record<string, string[]> = {};
                      activity.schedule.forEach((item) => {
                        const trimmed = item.trim();
                        const spaceIndex = trimmed.indexOf(" ");
                        if (spaceIndex > 0) {
                          const day = trimmed.substring(0, spaceIndex);
                          const time = trimmed.substring(spaceIndex + 1).trim();

                          const timeOnly = time.split("-")[0].trim();
                          if (!scheduleByDay[day]) {
                            scheduleByDay[day] = [];
                          }
                          if (!scheduleByDay[day].includes(timeOnly)) {
                            scheduleByDay[day].push(timeOnly);
                          }
                        }
                      });
                      const dayOrder: Record<string, number> = {
                        Lunes: 1,
                        Martes: 2,
                        Miércoles: 3,
                        Miercoles: 3,
                        Jueves: 4,
                        Viernes: 5,
                        Sábado: 6,
                        Sabado: 6,
                        Domingo: 7,
                      };
                      const sortedDays = Object.entries(scheduleByDay).sort(
                        ([a], [b]) => {
                          return (dayOrder[a] || 99) - (dayOrder[b] || 99);
                        },
                      );
                      return sortedDays.map(([day, times]) => (
                        <div
                          key={day}
                          className="border-b border-gray-100 pb-3 last:border-0"
                        >
                          <div className="font-medium text-gray-900 mb-2">
                            {day}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {times.sort().map((time, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay horarios configurados
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Link
                  href="/home"
                  className="inline-flex items-center text-gray-600 hover:text-[#DC2626] transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Volver a actividades
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
