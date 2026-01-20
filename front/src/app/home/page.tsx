"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppContext } from "src/contexts/AppContext";


import Image from "next/image";
import { activityService } from "src/app/lib";
import { Activity } from "src/interfaces/Activity";

const HomePage: React.FC = () => {
  const { loading: authLoading } = useAppContext();
  const router = useRouter();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
  try {
    setLoading(true);
    setError("");
    
    console.log("🔄 Cargando actividades desde el API...");
    

    const data = await activityService.getActiveActivities();
    
    console.log("✅ Actividades cargadas:", data.length);
    console.log("📋 Actividades:", data);
    setActivities(data);
  } catch (error) {
    console.error("❌ Error cargando actividades:", error);
    setError("Error al cargar las actividades. Por favor intenta nuevamente.");
  } finally {
    setLoading(false);
  }
};

  const getActivitySlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '-'); 
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    return `$${numPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (authLoading || loading) {
    return (
      <>

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <div className="text-xl text-gray-600">Cargando actividades...</div>
          </div>
        </div>

      </>
    );
  }

  if (error) {
    return (
      <>

        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadActivities}
              className="bg-[#DC2626] hover:bg-[#B01C1C] text-white py-3 px-6 rounded-md font-bold"
            >
              Reintentar
            </button>
          </div>
        </div>

      </>
    );
  }

  return (
    <>

      
      <main className="min-h-screen bg-white">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                ACTIVIDADES
              </h1>
              <p className="text-xl text-gray-600">
                Descubre las clases que ofrecemos
              </p>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay actividades disponibles
                </h3>
                <p className="text-gray-600">
                  Próximamente agregaremos nuevas actividades
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
                  >
                    <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                      <Image
                        src={activity.image}
                        alt={activity.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#DC2626] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                          {activity.name}
                        </span>
                      </div>
                      {activity.hasFreeTrial && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ¡Clase Gratis!
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-gray-600 text-sm mb-3 font-medium">
                        PROVIDENCE FITNESS
                      </p>

                      <div className="mb-6 flex-grow">
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {activity.description}
                        </p>
                      </div>

                      <div className="mb-4 text-xs text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Duración: {activity.duration} minutos
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Cupo: {activity.capacity} personas
                        </div>
                      </div>

                      <div className="mb-6 border-t border-gray-100 pt-4">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPrice(activity.price)}
                            </span>
                            <span className="text-gray-600 text-sm ml-2">/mensual</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        className="w-full bg-gray-900 hover:bg-[#DC2626] text-white py-3 px-4 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 transform hover:-translate-y-1 mt-auto"
                        onClick={() => router.push(`/activities/${getActivitySlug(activity.name)}`)}
                      >
                        Ver Horarios
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>


      </main>


    </>
  );
};

export default HomePage;