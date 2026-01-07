// components/TransformacionCTA.tsx (Versión Simple)
"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";


const TransformacionCTA: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <section className="bg-gradient-to-b from-gray-900 to-black text-white py-20">
      <div className="container mx-auto px-6 text-center">
        {/* Título exacto */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-tight">
          ¿LISTO PARA COMENZAR TU TRANSFORMACIÓN?
        </h2>
        
        {/* Descripción */}
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Únete a miles de miembros que ya han transformado sus vidas.
        </p>
        
        {/* Botón dinámico */}
        <Link 
          href={user ? "/activities" : "/login"}
          className="inline-block bg-[#DC2626] hover:bg-[#B01C1C] text-white px-12 py-4 rounded-md text-2xl font-bold uppercase tracking-wider transition-colors duration-300"
        >
          {user ? "RESERVAR CLASE AHORA" : "RESERVA TU CLASE HOY"}
        </Link>
        
        {/* Mensaje adicional según estado */}
        {user ? (
          <p className="mt-8 text-gray-400">
            Ya estás logueado como <span className="text-white font-semibold">{user.name}</span>. 
            ¡Ve directamente a reservar!
          </p>
        ) : (
          <p className="mt-8 text-gray-400">
            <Link href="/register" className="text-[#DC2626] hover:underline ml-1">
              Regístrate gratis
            </Link> para comenzar
          </p>
        )}
      </div>
    </section>
  );
};

export default TransformacionCTA;