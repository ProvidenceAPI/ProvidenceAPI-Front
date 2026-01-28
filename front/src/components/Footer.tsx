import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  MailIcon,
  PhoneIcon,
  LocationIcon,
} from "./SocialIcons";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* LÍNEA ROJA DECORATIVA */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* GRID 3 COLUMNAS RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 mb-8 sm:mb-12">
          {/* COLUMNA 1: LOGO Y REDES */}
          <div className="space-y-4 sm:space-y-6">
            {/* LOGO */}
            <div className="mb-2">
              <Image
                src="/logo.png"
                alt="Providence Fitness Logo"
                width={180}
                height={54}
                className="h-10 sm:h-14 w-auto"
                priority
              />
            </div>

            {/* DESCRIPCIÓN */}
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs">
              Transformá tu cuerpo, elevá tu vida.
              <span className="block mt-1">
                Unite a la revolución Providence hoy mismo.
              </span>
            </p>

            {/* REDES SOCIALES */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Seguinos
              </h4>
              <div className="flex gap-3 sm:gap-4">
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="https://www.instagram.com/provi.dencefitness?igsh=ZmVoeXRqMzR4bXM1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div>
            <div className="mb-4 sm:mb-6 pb-2 border-b border-gray-800">
              <h3 className="text-white font-bold text-base sm:text-lg tracking-tight">
                Navegación
              </h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Inicio", href: "/" },
                { name: "Sobre Nosotros", href: "/nosotros" },
                { name: "Actividades", href: "/home" },
                { name: "Testimonios", href: "/testimonios" },
                { name: "Ubicación", href: "/ubicacion" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-gray-300 hover:text-white transition-colors duration-200 text-xs sm:text-sm py-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 mr-2 sm:mr-3 transition-opacity duration-200"></span>
                    {item.name}
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO Y CTA */}
          <div>
            <ul className="space-y-3 sm:space-y-4 text-gray-300 mb-6 sm:mb-8">
              {/* TELÉFONO */}
              <li className="group flex items-start gap-2 sm:gap-3 hover:text-white transition-colors duration-200">
                <div className="mt-0.5 flex-shrink-0">
                  <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium break-words">
                    (555) 123-4567
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lunes a Sábado 7:00-22:00
                  </p>
                </div>
              </li>

              {/* EMAIL */}
              <li className="group flex items-start gap-2 sm:gap-3 hover:text-white transition-colors duration-200">
                <div className="mt-0.5 flex-shrink-0">
                  <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium break-all">
                    providenceapi@gmail.com
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Respondemos en 24h
                  </p>
                </div>
              </li>

              {/* UBICACIÓN */}
              <li className="group flex items-start gap-2 sm:gap-3 hover:text-white transition-colors duration-200">
                <div className="mt-0.5 flex-shrink-0">
                  <LocationIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">
                    Paraná 3745, Provincia de Buenos Aires
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Martinez, Argentina
                  </p>
                </div>
              </li>
            </ul>

            {/* BOTÓN DE ACCIÓN */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            >
              <span>Unite Ahora</span>
              <span className="ml-2">→</span>
            </Link>
            <p className="text-gray-500 text-xs text-center mt-2">
              ¡Tu primera clase es gratuita!
            </p>
          </div>
        </div>

        {/* DIVISIÓN Y COPYRIGHT */}
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-800 text-center space-y-2">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {currentYear} Providence Fitness. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs">
            Diseñado y desarrollado con ❤️ por nuestro equipo
          </p>
        </div>
      </div>
    </footer>
  );
};