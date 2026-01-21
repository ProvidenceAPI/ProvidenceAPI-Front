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

// 🔥 FIX: Agregar todos los slugs posibles
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

  const loadActivity = useCallback(async () => {
    try {
      setLoading(true);

      const activities = await activityService.getAllActivities();
      console.log("📋 Actividades del backend:", activities);
      console.log(
        "📋 Primera actividad completa:",
        JSON.stringify(activities[0], null, 2),
      );

      // 🔥 Búsqueda más flexible
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
        console.log("✅ Actividad encontrada:", foundActivity);
        setActivity(foundActivity);
      } else {
        console.error("❌ Actividad no encontrada para slug:", activitySlug);
        console.log(
          "🔍 Actividades disponibles:",
          activities.map((a: Activity) => a.name),
        );

        await Swal.fire({
          title: "Actividad no encontrada",
          text: `No se pudo encontrar la actividad "${activitySlug}"`,
          icon: "error",
          confirmButtonText: "Volver",
        });

        router.push("/home");
      }
    } catch (error) {
      console.error("❌ Error loading activity:", error);
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
      console.log("🔄 Cargando turnos para actividad:", activity.id);
      const availableTurns = await reservationService.getAvailableTurns(
        activity.id,
      );
      console.log("✅ Turnos cargados:", availableTurns);
      setTurns(availableTurns);
    } catch (error) {
      console.error("❌ Error loading turns:", error);
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
      console.error("❌ Error checking free reservation:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (isAuthenticated && user && activity) {
      loadAvailableTurns();
      checkUserFreeReservation();
    }
  }, [
    isAuthenticated,
    user,
    activity,
    loadAvailableTurns,
    checkUserFreeReservation,
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
      {/* Hero Section - 🔥 FIX: Usar imageUrl en lugar de image */}
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
              console.error("❌ Error cargando imagen hero:", activity.image);
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
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
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

          {/* Schedule Section */}
          <div>
            {loadingTurns ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#DC2626]"></div>
              </div>
            ) : (
              <ScheduleList
                activity={activity}
                turns={turns}
                isAuthenticated={isAuthenticated}
                userId={user?.id}
                onReserve={handleReserve}
                userHasFreeReservation={userHasFreeReservation}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
