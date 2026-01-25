import React from "react";

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
      {/* Sección Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            HISTORIAS DE <span className="text-red-600">ÉXITO</span>
          </h1>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Transformaciones reales de personas de nuestra comunidad. Mirá lo
            que es posible cuando te comprometés con vos mismo.
          </p>
          <p className="text-gray-500 mt-6 text-sm">
            ¿Querés ser parte?{" "}
            <a
              href="/login"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Registrate ahora
            </a>
          </p>
        </div>
      </section>
      {/* Sección de Testimonios */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`p-6 rounded-lg transition-all duration-300 hover:shadow-md border-2 hover:border-red-400 ${
                testimonial.highlighted
                  ? "border-red-500 bg-white"
                  : "border-gray-200 bg-gray-50 hover:bg-white"
              }`}
            >
              {/* Estrellas */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              {/* Testimonio */}
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              {/* Autor */}
              <div>
                <p className="font-bold text-black">{testimonial.author}</p>
                <p className="text-red-600 text-sm mt-1">{testimonial.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
