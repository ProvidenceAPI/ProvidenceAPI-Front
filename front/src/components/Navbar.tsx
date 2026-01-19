"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "src/contexts/AuthContext";
export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-black text-white py-4 px-6 sticky top-0 z-50 w-full">
      <div className="container mx-auto flex justify-between items-center">
       
        <div className="text-2xl font-bold tracking-[0.2em]">
          <Link href="/" className="flex flex-col hover:no-underline">
            <img src="/logo.png" alt="Providence Fitness Logo" className="h-8 w-auto" />
          </Link>
        </div>

       
        <div className="hidden md:flex items-center gap-8">
         
          {!user ? (
            <>
              <Link href="/" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Inicio
              </Link>
              <Link href="/nosotros" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Nosotros
              </Link>
              <Link href="/home" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Actividades
              </Link>
              <Link href="/testimonios" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Testimonios
              </Link>
              <Link href="/ubicacion" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Ubicacion
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <Link href="/login" className="px-6 py-2 rounded-md hover:bg-white hover:text-black transition-all duration-200 uppercase text-sm font-bold tracking-wider">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="px-6 py-2 rounded-md bg-[#DC2626] hover:bg-[#B01C1C] transition-all duration-200 uppercase text-sm font-bold tracking-wider">
                Únete Ahora
              </Link>
            </>
          ) : (
            
            <>
              <Link href="/home" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Actividades
              </Link>
              <Link href="/mis-reservas" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Mis Reservas
              </Link>
              <Link href="/mis-pagos" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Mis Pagos
              </Link>
              <Link href="/dashboard" className="hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium">
                Mi Perfil
              </Link>
              
             
              <div className="h-6 w-px bg-gray-700"></div>
              
             
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300">
                  Hola, {user.name?.split(' ')[0] || 'Usuario'}
                </span>
                <button 
                  onClick={() => logout()}
                  className="px-4 py-2 border border-gray-600 hover:border-[#DC2626] hover:text-[#DC2626] transition-all duration-200 uppercase text-sm font-bold tracking-wider"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>

       
        <button className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

    
      <div className="md:hidden bg-gray-900 px-6 py-4">
        {!user ? (
          <div className="flex flex-col gap-4">
            <Link href="/landing" className="hover:text-[#DC2626] py-2">Inicio</Link>
            <Link href="/home" className="hover:text-[#DC2626] py-2">Ver Actividades</Link>
            <Link href="/login" className="py-2">Iniciar Sesión</Link>
            <Link href="/register" className="text-[#DC2626] py-2">Únete Ahora</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Link href="/landing" className="hover:text-[#DC2626] py-2">Home</Link>
            <Link href="/home" className="hover:text-[#DC2626] py-2">Actividades</Link>
            <Link href="/reservations" className="hover:text-[#DC2626] py-2">Mis Reservas</Link>
            <Link href="/payments" className="hover:text-[#DC2626] py-2">Mis Pagos</Link>
            <Link href="/profile" className="hover:text-[#DC2626] py-2">Mi Perfil</Link>
           
            <button onClick={() => logout()} className="text-left py-2 text-gray-400">Cerrar sesión</button>
          </div>
        )}
      </div>
    </nav>
  );
};
