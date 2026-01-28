"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "src/contexts/AppContext";
import Image from "next/image";
import { activityService } from "src/app/lib";
import { Activity } from "src/interfaces/Activity";
import { activityChannel } from "src/utils/broadcastChannel";

const HomePage: React.FC = () => {
  const { loading: authLoading } = useAppContext();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await activityService.getActiveActivities();
      setActivities(data);
    } catch (error) {
      setError(
        "Error al cargar las actividades. Por favor intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    const handleActivityChange = (event: MessageEvent) => {
      loadActivities();
    };
    activityChannel.addEventListener("message", handleActivityChange);
    return () => {
      activityChannel.removeEventListener("message", handleActivityChange);
    };
  }, [loadActivities]);

  const getActivitySlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    return `$${numPrice.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <div className="text-lg sm:text-xl text-gray-600">Cargando actividades...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Error al cargar
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadActivities}
            className="bg-[#DC2626] hover:bg-[#B01C1C] text-white py-2.5 sm:py-3 px-6 rounded-md font-bold text-sm sm:text-base"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-3 sm:mb-4">
              ACTIVIDADES
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Descubre las clases que ofrecemos
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-5xl sm:text-6xl mb-4">📋</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No hay actividades disponibles
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Próximamente agregaremos nuevas actividades
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {activities.map((activity) => {
                const imageSource = activity.imageUrl || activity.image;
                return (
                  <div
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
                  >
                    {/* IMAGEN */}
                    {imageSource && !imageSource.includes("ejemplo") ? (
                      <div className="relative h-40 sm:h-48 w-full overflow-hidden flex-shrink-0">
                        <Image
                          src={imageSource}
                          alt={activity.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                          <span className="bg-[#DC2626] text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase">
                            {activity.name}
                          </span>
                        </div>
                        {activity.hasFreeTrial && (
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                            <span className="bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                              ¡Clase Gratis!
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-40 sm:h-48 w-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <span className="text-4xl sm:text-6xl">🏋️</span>
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                          <span className="bg-black/50 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase">
                            {activity.name}
                          </span>
                        </div>
                        {activity.hasFreeTrial && (
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                            <span className="bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                              ¡Clase Gratis!
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 text-center">
                          <span className="text-white/60 text-xs">
                            {!imageSource ? "Sin imagen" : "Imagen ejemplo"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CONTENIDO */}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <h3 className="text-gray-900 text-base sm:text-lg mb-2 sm:mb-3 font-bold uppercase text-center line-clamp-2">
                        {activity.name}
                      </h3>

                      <div className="mb-4 sm:mb-6 flex-grow">
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {activity.description}
                        </p>
                      </div>

                      {/* DETALLES */}
                      <div className="mb-4 text-xs text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="truncate">Duración: {activity.duration} min</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="truncate">Cupo: {activity.capacity} personas</span>
                        </div>
                      </div>

                      {/* PRECIO */}
                      <div className="mb-4 sm:mb-6 border-t border-gray-100 pt-3 sm:pt-4">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-lg sm:text-2xl font-bold text-gray-900">
                              {formatPrice(activity.price)}
                            </span>
                            <span className="text-gray-600 text-xs sm:text-sm ml-2">
                              /mensual
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BOTÓN */}
                      <button
                        className="w-full bg-gray-900 hover:bg-[#DC2626] text-white py-2 sm:py-3 px-4 rounded-md font-bold uppercase tracking-wider text-xs sm:text-sm transition-all duration-200 transform hover:-translate-y-1 mt-auto"
                        onClick={() =>
                          router.push(
                            `/activities/${getActivitySlug(activity.name)}`,
                          )
                        }
                      >
                        Ver Horarios
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;