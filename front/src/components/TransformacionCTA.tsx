// components/TransformacionCTA.tsx (Versión Simple)
"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";


const TransformacionCTA: React.FC = () => {
  const { user } = useAuth();

  return (
    <section
      className="text-white py-20"
      style={{
        background: "linear-gradient(90deg, #e11d1d 0%, #c51919 50%, #b91c1c 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-black mb-4 uppercase tracking-tight leading-tight">
          ¿LISTO PARA COMENZAR TU TRANSFORMACIÓN?
        </h2>

        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-3xl mx-auto">
          Únete a miles de miembros que ya han transformado sus vidas.
        </p>

        <div className="flex justify-center">
          <Link
            href={user ? "/activities" : "/login"}
            className="inline-block bg-white text-[#DC2626] px-6 py-3 rounded-md text-sm sm:text-base font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity duration-200"
          >
            {user ? "RESERVAR CLASE AHORA" : "RESERVA TU CLASE HOY"}
          </Link>
        </div>

       
      </div>
    </section>
  );
};

export default TransformacionCTA;