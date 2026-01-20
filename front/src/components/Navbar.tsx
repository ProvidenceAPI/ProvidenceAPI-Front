"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppContext } from "src/contexts/AppContext";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout, authLoading } = useAppContext();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Si está cargando, mostrar skeleton
  if (authLoading) {
    return (
      <nav className="bg-black text-white py-4 px-6 sticky top-0 z-50 w-full">
        <div className="container mx-auto flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="hidden md:flex gap-8">
            <div className="h-6 w-16 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-8 bg-gray-800 rounded animate-pulse md:hidden"></div>
        </div>
      </nav>
    );
  }

  // Determinar QUÉ links mostrar según rol
  const renderDesktopLinks = () => {
    // ==================== USUARIO NO AUTENTICADO ====================
    if (!isAuthenticated) {
      return (
        <>
          <Link href="/" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/' ? 'text-[#DC2626]' : ''}`}>
            Inicio
          </Link>
          <Link href="/nosotros" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/nosotros' ? 'text-[#DC2626]' : ''}`}>
            Nosotros
          </Link>
          <Link href="/home" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/home' || pathname.startsWith('/activities') ? 'text-[#DC2626]' : ''}`}>
            Actividades
          </Link>
          <Link href="/testimonios" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/testimonios' || pathname === '/testimonies' ? 'text-[#DC2626]' : ''}`}>
            Testimonios
          </Link>
          <Link href="/ubicacion" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/ubicacion' ? 'text-[#DC2626]' : ''}`}>
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
      );
    }

    // ==================== SUPER ADMIN ====================
    if (isSuperAdmin) {
      return (
        <>
          <Link href="/admin-dashboard" className={`px-4 py-2 rounded uppercase text-sm font-bold tracking-wider ${pathname === '/admin-dashboard' ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
            Admin-Dashboard
          </Link>
          <Link href="/users" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/users' ? 'text-[#DC2626]' : ''}`}>
            Users
          </Link>
          <Link href="/turns" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/turns' ? 'text-[#DC2626]' : ''}`}>
            Turns
          </Link>
          <Link href="/adminCreationForm" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/adminCreationForm' ? 'text-[#DC2626]' : ''}`}>
            Crear Admin
          </Link>
           <Link href="/mis-reservas" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/mis-reservas' ? 'text-[#DC2626]' : ''}`}>
          Mis Reservas
        </Link>
        <Link href="/dashboard" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/dashboard' ? 'text-[#DC2626]' : ''}`}>
          Mi Perfil
        </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              👑 {user?.name?.split(' ')[0] || 'Super Admin'}
            </span>
            <button 
              onClick={() => logout()}
              className="px-4 py-2 border border-gray-600 hover:border-[#DC2626] hover:text-[#DC2626] transition-all duration-200 uppercase text-sm font-bold tracking-wider"
            >
              Salir
            </button>
          </div>
        </>
      );
    }

    // ==================== ADMIN (no super) ====================
    if (isAdmin) {
      return (
        <>
          <Link href="/dashboard" className={`px-4 py-2 rounded uppercase text-sm font-bold tracking-wider ${pathname === '/dashboard' ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
            Dashboard
          </Link>
          <Link href="/users" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/users' ? 'text-[#DC2626]' : ''}`}>
            Users
          </Link>
          <Link href="/activitiesDashboard" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/activitiesDashboard' ? 'text-[#DC2626]' : ''}`}>
            Actividades
          </Link>
          <Link href="/turns" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/turns' ? 'text-[#DC2626]' : ''}`}>
            Turns
          </Link>
           <Link href="/mis-reservas" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/mis-reservas' ? 'text-[#DC2626]' : ''}`}>
          Mis Reservas
        </Link>
        <Link href="/dashboard" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/dashboard' ? 'text-[#DC2626]' : ''}`}>
          Mi Perfil
        </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              👔 {user?.name?.split(' ')[0] || 'Admin'}
            </span>
            <button 
              onClick={() => logout()}
              className="px-4 py-2 border border-gray-600 hover:border-[#DC2626] hover:text-[#DC2626] transition-all duration-200 uppercase text-sm font-bold tracking-wider"
            >
              Salir
            </button>
          </div>
        </>
      );
    }

    // ==================== USUARIO NORMAL AUTENTICADO ====================
    return (
      <>
        <Link href="/home" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/home' || pathname.startsWith('/activities') ? 'text-[#DC2626]' : ''}`}>
          Actividades
        </Link>
        <Link href="/mis-reservas" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/mis-reservas' ? 'text-[#DC2626]' : ''}`}>
          Mis Reservas
        </Link>
        <Link href="/mis-pagos" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/mis-pagos' ? 'text-[#DC2626]' : ''}`}>
          Mis Pagos
        </Link>
        <Link href="/dashboard" className={`hover:text-[#DC2626] transition-colors duration-200 uppercase tracking-wider text-sm font-medium ${pathname === '/dashboard' ? 'text-[#DC2626]' : ''}`}>
          Mi Perfil
        </Link>
        <div className="h-6 w-px bg-gray-700"></div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">
            👤 {user?.name?.split(' ')[0] || 'Usuario'}
          </span>
          <button 
            onClick={() => logout()}
            className="px-4 py-2 border border-gray-600 hover:border-[#DC2626] hover:text-[#DC2626] transition-all duration-200 uppercase text-sm font-bold tracking-wider"
          >
            Salir
          </button>
        </div>
      </>
    );
  };

  // Render para móvil
  const renderMobileLinks = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col gap-4">
          <Link href="/" className="hover:text-[#DC2626] py-2 border-b border-gray-800 pb-3" onClick={() => setMobileMenuOpen(false)}>
            Inicio
          </Link>
          <Link href="/nosotros" className="hover:text-[#DC2626] py-2 border-b border-gray-800 pb-3" onClick={() => setMobileMenuOpen(false)}>
            Nosotros
          </Link>
          <Link href="/home" className="hover:text-[#DC2626] py-2 border-b border-gray-800 pb-3" onClick={() => setMobileMenuOpen(false)}>
            Actividades
          </Link>
          <Link href="/testimonios" className="hover:text-[#DC2626] py-2 border-b border-gray-800 pb-3" onClick={() => setMobileMenuOpen(false)}>
            Testimonios
          </Link>
          <Link href="/ubicacion" className="hover:text-[#DC2626] py-2 border-b border-gray-800 pb-3" onClick={() => setMobileMenuOpen(false)}>
            Ubicacion
          </Link>
          <div className="h-px bg-gray-700 my-2"></div>
          <Link href="/login" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Iniciar Sesión
          </Link>
          <Link href="/register" className="text-[#DC2626] py-2 font-bold" onClick={() => setMobileMenuOpen(false)}>
            Únete Ahora
          </Link>
        </div>
      );
    }

    if (isSuperAdmin) {
      return (
        <div className="flex flex-col gap-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">SUPER ADMIN</div>
          <Link href="/admin-dashboard" className="text-purple-400 py-2" onClick={() => setMobileMenuOpen(false)}>
            Admin-Dashboard
          </Link>
          <Link href="/users" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Users
          </Link>
          <Link href="/turns" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Turns
          </Link>
          <Link href="/adminCreationForm" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Crear Admin
          </Link>
          <div className="h-px bg-gray-700 my-2"></div>
          <div className="text-sm text-gray-300 py-2">
            👑 {user?.name?.split(' ')[0] || 'Super Admin'}
          </div>
          <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left py-2 text-gray-400">
            Cerrar sesión
          </button>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="flex flex-col gap-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">ADMIN</div>
          <Link href="/admin-dashboard" className="text-purple-400 py-2" onClick={() => setMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/users" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Users
          </Link>
          <Link href="/activitiesDashboard" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Actividades
          </Link>
          <Link href="/turns" className="py-2" onClick={() => setMobileMenuOpen(false)}>
            Turns
          </Link>
          <div className="h-px bg-gray-700 my-2"></div>
          <div className="text-sm text-gray-300 py-2">
            👔 {user?.name?.split(' ')[0] || 'Admin'}
          </div>
          <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left py-2 text-gray-400">
            Cerrar sesión
          </button>
        </div>
      );
    }

    // Usuario normal
    return (
      <div className="flex flex-col gap-4">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">MI CUENTA</div>
        <Link href="/home" className="py-2" onClick={() => setMobileMenuOpen(false)}>
          Actividades
        </Link>
        <Link href="/mis-reservas" className="py-2" onClick={() => setMobileMenuOpen(false)}>
          Mis Reservas
        </Link>
        <Link href="/mis-pagos" className="py-2" onClick={() => setMobileMenuOpen(false)}>
          Mis Pagos
        </Link>
        <Link href="/dashboard" className="py-2" onClick={() => setMobileMenuOpen(false)}>
          Mi Perfil
        </Link>
        <div className="h-px bg-gray-700 my-2"></div>
        <div className="text-sm text-gray-300 py-2">
          👤 {user?.name?.split(' ')[0] || 'Usuario'}
        </div>
        <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left py-2 text-gray-400">
          Cerrar sesión
        </button>
      </div>
    );
  };

  return (
    <nav className="bg-black text-white py-4 px-6 sticky top-0 z-50 w-full shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo - SIEMPRE lleva a la página principal según rol */}
        <div className="text-2xl font-bold tracking-[0.2em]">
          <Link 
            href={isAuthenticated ? (isAdmin || isSuperAdmin ? "/admin-dashboard" : "/dashboard") : "/"} 
            className="flex flex-col hover:no-underline"
          >
            <Image src="/logo.png" alt="Providence Fitness Logo" width={120} height={32} className="h-8 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {renderDesktopLinks()}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 px-6 py-4 animate-fadeIn">
          {renderMobileLinks()}
        </div>
      )}
    </nav>
  );
};