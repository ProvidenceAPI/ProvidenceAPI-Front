import React from "react";
import Link from "next/link";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  rol: string;
  rating: number;
  highlighted?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Providence Fitness cambió mi vida! Bajé 14 kilos y gané una fuerza increíble. Nunca me sentí tan bien.",
    author: "Martina López",
    rol: "Miembro desde 2022",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Los entrenadores son unos cracks y la comunidad es re copada. Me siento como en casa.",
    author: "Facundo Rodríguez",
    rol: "Boxeador amateur",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "La mejor inversión que hice en mi vida! Estoy más fuerte y seguro que nunca. Los resultados hablan por sí solos.",
    author: "Valentina García",
    rol: "Miembro VIP",
    rating: 5,
    highlighted: true,
  },
  {
    id: 4,
    quote:
      "De estar en el sillón a correr 10k en 6 meses. Providence me dio las herramientas y la motivación.",
    author: "Lautaro Fernández",
    rol: "Corredor de maratón",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Las clases personalizadas son una locura. Con el seguimiento que hacen, es imposible no progresar.",
    author: "Agustina Silva",
    rol: "Crossfit enthusiast",
    rating: 5,
  },
  {
    id: 6,
    quote:
      "Después de mi lesión, Providence me ayudó a recuperarme. Los profes son unos genios y te cuidan posta.",
    author: "Nicolás Pérez",
    rol: "Futbolista recuperado",
    rating: 5,
  },
];

export default function TestimoniosPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* SECCIÓN HERO */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6">
            HISTORIAS DE <span className="text-red-600">ÉXITO</span>
          </h1>
          <div className="w-16 sm:w-20 h-1 bg-red-600 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-700 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Transformaciones reales de personas de nuestra comunidad. Mirá lo
            que es posible cuando te comprometés con vos mismo.
          </p>
          <p className="text-gray-500 mt-4 sm:mt-6 text-xs sm:text-sm">
            ¿Querés ser parte?{" "}
            <Link
              href="/login"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Registrate ahora
            </Link>
          </p>
        </div>
      </section>

      {/* SECCIÓN DE TESTIMONIOS */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`p-4 sm:p-6 rounded-lg transition-all duration-300 hover:shadow-md border-2 hover:border-red-400 ${
                testimonial.highlighted
                  ? "border-red-500 bg-white"
                  : "border-gray-200 bg-gray-50 hover:bg-white"
              }`}
            >
              {/* ESTRELLAS */}
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-base sm:text-lg">
                    ★
                  </span>
                ))}
              </div>

              {/* TESTIMONIO */}
              <p className="text-gray-700 italic mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                "{testimonial.quote}"
              </p>

              {/* AUTOR */}
              <div>
                <p className="font-bold text-black text-sm sm:text-base">
                  {testimonial.author}
                </p>
                <p className="text-red-600 text-xs sm:text-sm mt-1">
                  {testimonial.rol}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}