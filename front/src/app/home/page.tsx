"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TransformacionCTA from "src/components/TransformacionCTA";
import { useAuth } from "src/contexts/AuthContext";
import { Footer } from "src/components/Footer";
import { Navbar } from "src/components/Navbar";
import Image from "next/image";

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Datos actualizados con imágenes y descripciones
  const activities = [
    {
      id: 1,
      name: "CROSSFIT",
      subtitle: "PROVIDENCE FITNESS",
      price: "$5.000",
      period: "Mensual",
      description: "Entrenamiento funcional de alta intensidad que combina levantamiento de pesas, cardio y gimnasia. Desarrolla fuerza, resistencia y agilidad.",
      image: "/actividades/crossfit.jpg",
      url: "/activities/crossfit"
    },
    {
      id: 2,
      name: "HIIT",
      subtitle: "PROVIDENCE",
      price: "$5.000",
      period: "Mensual",
      description: "Entrenamiento por intervalos de alta intensidad. Quema calorías en menos tiempo y acelera tu metabolismo con sesiones cortas e intensas.",
      image: "/actividades/hiit.jpg",
      url: "/activities/hiit"
    },
    {
      id: 3,
      name: "FUNCIONAL",
      subtitle: "PROVIDENCE",
      price: "$5.000",
      period: "Mensual",
      description: "Mejora tu movilidad y fuerza con ejercicios que imitan movimientos cotidianos. Ideal para mejorar postura y prevenir lesiones.",
      image: "/actividades/funcional.jpg",
      url: "/activities/funcional"
    },
    {
      id: 4,
      name: "OPEN BOX",
      subtitle: "PROVIDENCE",
      price: "$3.000",
      period: "Mensual",
      description: "Espacio libre para entrenar a tu ritmo. Acceso a todas las instalaciones y equipos para que diseñes tu propio entrenamiento.",
      image: "/actividades/openbox.jpg",
      url: "/activities/open-box"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-white">
        {/* Sección de actividades */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Título principal */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                ACTIVIDADES
              </h1>
              <p className="text-xl text-gray-600">
                Descubre las clases que ofrecemos
              </p>
            </div>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  {/* Imagen de la actividad */}
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
                  </div>

                  {/* Contenido de la tarjeta - Se expande para ocupar espacio */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Subtítulo */}
                    <p className="text-gray-600 text-sm mb-3 font-medium">
                      {activity.subtitle}
                    </p>

                    {/* Descripción - Más espacio */}
                    <div className="mb-6 flex-grow">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {activity.description}
                      </p>
                    </div>

                    {/* Precio y periodo */}
                    <div className="mb-6 border-t border-gray-100 pt-4">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">{activity.price}</span>
                          <span className="text-gray-600 text-sm ml-2">/{activity.period.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón */}
                    <button 
                      className="w-full bg-gray-900 hover:bg-[#DC2626] text-white py-3 px-4 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 transform hover:-translate-y-1 mt-auto"
                      onClick={() => router.push(activity.url)}
                    >
                      Ver Horarios
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TransformacionCTA />
      </main>

      <Footer />
    </>
  );
};

export default HomePage;