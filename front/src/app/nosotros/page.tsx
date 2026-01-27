"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NosotrosFooter from "src/components/NosotrosFooter";

const media = [
  { type: "image", src: "/media/nosotros1.jpg" },
  { type: "image", src: "/media/nosotros2.jpg" },
  { type: "image", src: "/media/nosotros3.jpg" },
  { type: "image", src: "/media/nosotros4.jpg" },
  { type: "image", src: "/media/nosotros5.jpg" },
  { type: "image", src: "/media/nosotros6.jpg" },
  { type: "image", src: "/media/nosotros7.jpg" },
  { type: "image", src: "/media/nosotros8.jpg" },
  { type: "image", src: "/media/nosotros9.jpg" },
  { type: "image", src: "/media/nosotros10.jpg" },
  { type: "image", src: "/media/nosotros11.jpg" },
  { type: "image", src: "/media/nosotros12.jpg" },
  { type: "image", src: "/media/nosotros13.jpg" },
  { type: "video", src: "/media/nosotros14.mp4" },
];

export default function NosotrosPage() {
  const [current, setCurrent] = useState(0);

  return (
    <>
      <div className="bg-white text-black min-h-screen">
        {/* QUIÉNES SOMOS */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 px-6 items-center">
            <div className="space-y-8">
              <div>
                <span className="text-red-600 font-bold text-lg tracking-wider">
                  PROVIDENCE FITNESS
                </span>
                <h2 className="text-4xl md:text-5xl font-black mt-2 mb-6 text-gray-900">
                  QUIÉNES <span className="text-red-600">SOMOS</span>
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                  <span className="text-gray-900 font-semibold">
                    Providence Fitness
                  </span>{" "}
                  nace de entrenadores y atletas que creen que el fitness no es
                  solo transpirar, sino progresar de verdad.
                </p>
                <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                  Creamos un espacio donde cada persona recibe{" "}
                  <span className="text-gray-900 font-semibold">
                    atención real, estructura y acompañamiento constante
                  </span>
                  . No somos una cadena, somos tu equipo.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-0.5 bg-red-600"></div>
                <span className="text-gray-500 text-sm tracking-wider">
                  DESDE 2025
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-transparent rounded-3xl blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-red-600/30">
                <Image
                  src="/media/nosotros2.jpg"
                  alt="Equipo Providence Fitness"
                  width={800}
                  height={500}
                  className="w-full h-[400px] md:h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-0.5 bg-red-600"></div>
                    <span className="text-white text-sm tracking-wider">
                      ENTRENAMIENTO ESTRUCTURADO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CARRUSEL MULTIMEDIA */}
        <section className="py-24 md:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
                VIVÍ <span className="text-red-600">PROVIDENCE</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Descubrí la experiencia completa a través de nuestros espacios,
                entrenamientos y comunidad.
              </p>
            </div>
            <div className="relative max-w-6xl mx-auto">
              <div className="relative bg-white rounded-3xl border border-red-600/30 shadow-xl h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
                {media[current].type === "image" ? (
                  <Image
                    src={media[current].src}
                    alt="Galería Providence"
                    width={900}
                    height={600}
                    className="max-h-full max-w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                ) : (
                  <video
                    src={media[current].src}
                    className="max-h-full max-w-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                )}
              </div>
              {/* Controles del carrusel */}
              <div className="flex justify-center mt-8 gap-4">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === current
                        ? "bg-red-600 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Ir a la imagen ${index + 1}`}
                  />
                ))}
              </div>
              {/* Flechas de navegación */}
              <button
                onClick={() =>
                  setCurrent((current - 1 + media.length) % media.length)
                }
                className="absolute left-4 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border border-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 group shadow-lg"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setCurrent((current + 1) % media.length)}
                className="absolute right-4 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border border-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 group shadow-lg"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </section>
        {/* MISIÓN Y VALORES */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-white to-red-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-red-600 font-bold text-lg tracking-wider">
                NUESTRO PROPÓSITO
              </span>
              <h2 className="text-4xl md:text-5xl font-black mt-2 mb-6 text-gray-900">
                MISIÓN <span className="text-red-600">Y VISIÓN</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="bg-white rounded-2xl p-8 border border-red-600/20 shadow-lg">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-10 h-0.5 bg-red-600"></div>
                  <h3 className="text-2xl font-bold text-gray-900">MISIÓN</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Entrenar personas fuertes para la vida, no solo para competir.
                  Brindar herramientas físicas y mentales que trascienden el
                  gimnasio.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-red-600/20 shadow-lg">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-10 h-0.5 bg-red-600"></div>
                  <h3 className="text-2xl font-bold text-gray-900">VISIÓN</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Ser la comunidad fitness de referencia donde cada miembro
                  logra sus objetivos personales a través de metodología,
                  dedicación y soporte real.
                </p>
              </div>
            </div>
            {/* VALORES */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
                NUESTROS VALORES
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "EXCELENCIA",
                    desc: "En cada entrenamiento y seguimiento",
                  },
                  { title: "COMUNIDAD", desc: "Apoyo real entre miembros" },
                  {
                    title: "DISCIPLINA",
                    desc: "Consistencia sobre intensidad",
                  },
                  {
                    title: "INNOVACIÓN",
                    desc: "Métodos actualizados constantemente",
                  },
                  {
                    title: "PASIÓN",
                    desc: "Amor por el proceso, no solo los resultados",
                  },
                  {
                    title: "RESPONSABILIDAD",
                    desc: "Compromiso con tu transformación",
                  },
                ].map((valor, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-red-600/50 hover:shadow-xl transition-all duration-300 shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-0.5 bg-red-600"></div>
                      <h4 className="font-bold text-lg text-red-600">
                        {valor.title}
                      </h4>
                    </div>
                    <p className="text-gray-600">{valor.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
         <NosotrosFooter/>
      </div>
    </>
  );
}
