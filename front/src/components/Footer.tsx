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
      {/* Línea roja decorativa */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Columna 1: Logo y Redes */}
          <div className="space-y-6">
            <div className="mb-2">
              <Image
                src="/logo.png"
                alt="Providence Fitness Logo"
                width={180}
                height={54}
                className="h-14 w-auto"
                priority
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Transformá tu cuerpo, elevá tu vida.
              <span className="block mt-1">
                Unite a la revolución Providence hoy mismo.
              </span>
            </p>
            {/* Redes Sociales */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                Seguinos
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover:scale-110"
                  aria-label="Facebook (se abre en nueva pestaña)"
                >
                  <FacebookIcon className="w-6 h-6" />
                </a>
                <a
                  href="https://www.instagram.com/provi.dencefitness?igsh=ZmVoeXRqMzR4bXM1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover:scale-110"
                  aria-label="Instagram (se abre en nueva pestaña)"
                >
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover:scale-110"
                  aria-label="Twitter (se abre en nueva pestaña)"
                >
                  <TwitterIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-6 pb-2 border-b border-gray-800">
              <h3 className="text-white font-bold text-lg tracking-tight">
                Navegación
              </h3>
            </div>
            <ul className="space-y-3">
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
                    className="group flex items-center text-gray-300 hover:text-white transition-colors duration-200 text-sm py-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 mr-3 transition-opacity duration-200"></span>
                    {item.name}
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ul className="space-y-4 text-gray-300">
              <li className="group flex items-start gap-3 hover:text-white transition-colors duration-200">
                <div className="mt-0.5">
                  <PhoneIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div>
                  <p className="text-sm font-medium">(555) 123-4567</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lunes a Sábado 7:00-22:00
                  </p>
                </div>
              </li>
              <li className="group flex items-start gap-3 hover:text-white transition-colors duration-200">
                <div className="mt-0.5">
                  <MailIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    info@providencefitness.com
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Respondemos en 24h
                  </p>
                </div>
              </li>
              <li className="group flex items-start gap-3 hover:text-white transition-colors duration-200">
                <div className="mt-0.5">
                  <LocationIcon className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Provincia de Buenos Aires 760
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cipoletti, Argentina
                  </p>
                </div>
              </li>
            </ul>
            {/* Botón de acción */}
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 text-sm"
              >
                <span>Unite Ahora</span>
                <span className="ml-2">→</span>
              </Link>
              <p className="text-gray-500 text-xs text-center mt-2">
                ¡Tu primera clase es gratuita!
              </p>
            </div>
          </div>
        </div>

        {/* División y copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Providence Fitness. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Diseñado y desarrollado con ❤️ por nuestro equipo
          </p>
        </div>
      </div>
    </footer>
  );
};
