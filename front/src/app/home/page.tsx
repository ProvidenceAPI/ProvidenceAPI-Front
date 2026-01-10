"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TransformacionCTA from "src/components/TransformacionCTA";
import { useAuth } from "src/contexts/AuthContext";
import { Footer } from "src/components/Footer";
import { Navbar } from "src/components/Navbar";

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Datos EXACTOS según tu imagen
  const activities = [
    {
      id: 1,
      name: "CROSSFIT",
      subtitle: "PROVIDENCE FITNESS",
      price: "$5.000",
      period: "Mensual",
      schedule: "Lunes a Viernes: 07:00 a 22:00hs",
      url: "/activities/crossfit"
    },
    {
      id: 2,
      name: "HIIT",
      subtitle: "PROVIDENCE",
      price: "$5.000",
      period: "Mensual",
      schedule: "Martes y Jueves: 19:00 y 21:00hs",
      url: "/activities/hiit"
    },
    {
      id: 3,
      name: "FUNCIONAL",
      subtitle: "PROVIDENCE",
      price: "$5.000",
      period: "Mensual",
      schedule: "Lunes, Miércoles y Viernes: 09:00, 17:00 y 20:00hs",
      url: "/activities/funcional"
    },
    {
      id: 4,
      name: "OPEN BOX",
      subtitle: "PROVIDENCE",
      price: "$3.000",
      period: "Mensual",
      schedule: "Lunes a Viernes: 14:00 a 17:000hs",
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
        {/* Sección de actividades - EXACTA a la imagen */}
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

            {/* Grid de tarjetas - EXACTO al diseño */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Header de la tarjeta */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="mb-2">
                      <h3 className="text-2xl font-bold uppercase text-gray-900 tracking-tight">
                        {activity.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {activity.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    {/* Precio */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{activity.price}</span>
                        <span className="text-gray-600 ml-1">{activity.period}</span>
                      </div>
                    </div>

                    {/* Horarios */}
                    <div className="mb-8">
                      <div className="text-gray-700">
                        <p className="font-medium mb-1">Horarios:</p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {activity.schedule}
                        </p>
                      </div>
                    </div>

                    {/* Botón */}
                    <button 
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-md font-bold uppercase tracking-wider text-sm transition-colors duration-200"
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