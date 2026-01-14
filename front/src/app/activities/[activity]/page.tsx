"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "src/components/Navbar";
import { Footer } from "src/components/Footer";
import Image from "next/image";
import Link from "next/link";

// Datos de las actividades con horarios no superpuestos
const activitiesData = {
  "crossfit": {
    id: 1,
    name: "CROSSFIT",
    subtitle: "PROVIDENCE FITNESS",
    price: "$5.000",
    period: "Mensual",
    description: "Entrenamiento funcional de alta intensidad que combina levantamiento de pesas, cardio y gimnasia. Desarrolla fuerza, resistencia y agilidad.",
    fullDescription: "El CrossFit es un programa de fuerza y acondicionamiento que combina levantamiento de pesas olímpico, gimnasia y ejercicios cardiovasculares. Diseñado para mejorar 10 capacidades físicas: resistencia cardiovascular, resistencia muscular, fuerza, flexibilidad, potencia, velocidad, coordinación, agilidad, equilibrio y precisión.",
    image: "/actividades/crossfit.jpg",
    schedule: [
      { day: "Lunes", hours: ["07:00", "09:00", "17:00", "19:00"] },
      { day: "Martes", hours: ["07:00", "09:00", "17:00", "19:00"] },
      { day: "Miércoles", hours: ["07:00", "09:00", "17:00", "19:00"] },
      { day: "Jueves", hours: ["07:00", "09:00", "17:00", "19:00"] },
      { day: "Viernes", hours: ["07:00", "09:00", "17:00", "19:00"] },
      { day: "Sábado", hours: ["09:00", "11:00"] }
    ],
    benefits: [
      "Aumento de fuerza muscular",
      "Mejora de resistencia cardiovascular",
      "Pérdida de grasa efectiva",
      "Desarrollo de agilidad y coordinación",
      "Comunidad activa y motivadora"
    ],
    trainer: "Coach Martín - Certificado CrossFit Level 2"
  },
  "hiit": {
    id: 2,
    name: "HIIT",
    subtitle: "PROVIDENCE",
    price: "$5.000",
    period: "Mensual",
    description: "Entrenamiento por intervalos de alta intensidad. Quema calorías en menos tiempo y acelera tu metabolismo con sesiones cortas e intensas.",
    fullDescription: "High Intensity Interval Training (HIIT) consiste en alternar períodos cortos de ejercicio anaeróbico intenso con períodos menos intensos de recuperación. Ideal para quemar grasa, mejorar el metabolismo y aumentar la capacidad cardiovascular en sesiones de 30-45 minutos.",
    image: "/actividades/hiit.jpg",
    schedule: [
      { day: "Lunes", hours: ["08:00", "10:00", "18:00", "20:00"] },
      { day: "Miércoles", hours: ["08:00", "10:00", "18:00", "20:00"] },
      { day: "Viernes", hours: ["08:00", "10:00", "18:00", "20:00"] },
      { day: "Sábado", hours: ["10:00", "12:00"] }
    ],
    benefits: [
      "Quema de calorías post-entrenamiento (efecto afterburn)",
      "Sesiones cortas (30-45 min)",
      "Mejora de capacidad cardiovascular",
      "Aumento del metabolismo basal",
      "Sin necesidad de equipamiento especial"
    ],
    trainer: "Coach Ana - Especialista en Entrenamiento Metabólico"
  },
  "funcional": {
    id: 3,
    name: "FUNCIONAL",
    subtitle: "PROVIDENCE",
    price: "$5.000",
    period: "Mensual",
    description: "Mejora tu movilidad y fuerza con ejercicios que imitan movimientos cotidianos. Ideal para mejorar postura y prevenir lesiones.",
    fullDescription: "El entrenamiento funcional se centra en movimientos que imitan las actividades de la vida diaria, mejorando la fuerza, equilibrio, coordinación y resistencia. Utiliza principalmente el peso corporal, bandas de resistencia, kettlebells y otros elementos que favorecen la movilidad natural.",
    image: "/actividades/funcional.jpg",
    schedule: [
      { day: "Martes", hours: ["08:00", "10:00", "16:00", "18:00"] },
      { day: "Jueves", hours: ["08:00", "10:00", "16:00", "18:00"] },
      { day: "Sábado", hours: ["08:00", "14:00"] }
    ],
    benefits: [
      "Mejora de la postura corporal",
      "Prevención de lesiones",
      "Aumento de la movilidad articular",
      "Fuerza aplicada a movimientos cotidianos",
      "Ideal para todas las edades"
    ],
    trainer: "Coach Lucas - Fisioterapeuta y Entrenador Funcional"
  },
  "open-box": {
    id: 4,
    name: "OPEN BOX",
    subtitle: "PROVIDENCE",
    price: "$3.000",
    period: "Mensual",
    description: "Espacio libre para entrenar a tu ritmo. Acceso a todas las instalaciones y equipos para que diseñes tu propio entrenamiento.",
    fullDescription: "Open Box es nuestro espacio libre donde puedes entrenar a tu propio ritmo. Acceso completo a todas las instalaciones y equipos: pesas libres, máquinas de cardio, bancos, barras, y zona de stretching. Ideal para quienes prefieren diseñar su propia rutina o complementar otras actividades.",
    image: "/actividades/openbox.jpg",
    schedule: [
      { day: "Lunes a Viernes", hours: ["14:00", "15:00", "16:00", "17:00"] },
      { day: "Sábado", hours: ["12:00", "13:00", "14:00"] }
    ],
    benefits: [
      "Acceso completo a instalaciones",
      "Flexibilidad horaria",
      "Entrenamiento personalizado",
      "Sin límite de tiempo",
      "Ideal para combinar con otras actividades"
    ],
    trainer: "Supervisión permanente de nuestro staff"
  }
};

export default function ActivityPage() {
  const params = useParams();
  const router = useRouter();
  const activitySlug = params.activity as string;
  
  const activity = activitiesData[activitySlug as keyof typeof activitiesData];

  // Si la actividad no existe, redirigir a home
  if (!activity) {
    router.push("/home");
    return null;
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section con imagen */}
        <div className="relative h-64 md:h-80 bg-gray-900">
          <Image
            src={activity.image}
            alt={activity.name}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold uppercase mb-2">
                {activity.name}
              </h1>
              <p className="text-xl">{activity.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna izquierda - Información */}
              <div className="lg:col-span-2">
                {/* Descripción completa */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {activity.fullDescription}
                  </p>
                </div>

                {/* Beneficios */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Beneficios</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activity.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-[#DC2626] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Entrenador */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold mb-2">👨‍🏫 Entrenador</h3>
                  <p className="text-gray-700">{activity.trainer}</p>
                </div>
              </div>

              {/* Columna derecha - Horarios y precio */}
              <div className="lg:col-span-1">
                {/* Tarjeta de precio */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Precio</h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">{activity.price}</div>
                    <div className="text-gray-600">/{activity.period.toLowerCase()}</div>
                  </div>
                  <button 
                    className="w-full bg-[#DC2626] hover:bg-[#B01C1C] text-white py-3 rounded-md font-bold uppercase tracking-wider transition-colors duration-200"
                    onClick={() => router.push("/register")}
                  >
                    Inscribirse Ahora
                  </button>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    ¡Primera clase gratuita!
                  </p>
                </div>

                {/* Horarios */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4">📅 Horarios</h3>
                  <div className="space-y-4">
                    {activity.schedule.map((schedule, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="font-medium text-gray-900">{schedule.day}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {schedule.hours.map((hour, hourIndex) => (
                            <span 
                              key={hourIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                            >
                              {hour}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500">
                    <p>📍 Duración de clase: 60 minutos</p>
                    <p>👥 Cupo máximo por clase: 15 personas</p>
                    <p>📝 Reserva con 24h de anticipación</p>
                  </div>
                </div>

                {/* Botón volver */}
                <div className="mt-6">
                  <Link 
                    href="/home"
                    className="inline-flex items-center text-gray-600 hover:text-[#DC2626] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a actividades
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}