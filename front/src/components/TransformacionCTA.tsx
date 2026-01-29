"use client";

import React from "react";
import Link from "next/link";
import { useAppContext } from "src/contexts/AppContext";

const TransformacionCTA: React.FC = () => {
  const { user } = useAppContext();

  return (
    <section
      className="text-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(90deg, #e11d1d 0%, #c51919 50%, #b91c1c 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto text-center">
        {/* TÍTULO */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 md:mb-8 uppercase tracking-tight leading-tight">
          ¿LISTO PARA COMENZAR TU TRANSFORMACIÓN?
        </h2>

        {/* DESCRIPCIÓN */}
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
          Únete a miles de miembros que ya han transformado sus vidas.
        </p>

        {/* BOTÓN */}
        <div className="flex justify-center">
          <Link
            href={user ? "/home" : "/login"}
            className="inline-block bg-white text-[#DC2626] px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-md text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-200 transform hover:scale-105"
          >
            {user ? "RESERVAR CLASE AHORA" : "RESERVA TU CLASE HOY"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TransformacionCTA;