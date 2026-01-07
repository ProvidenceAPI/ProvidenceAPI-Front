import React from "react";
import Link from "next/link";
import { FacebookIcon, InstagramIcon,TwitterIcon, MailIcon, PhoneIcon, LocationIcon} from "./SocialIcons";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-2 border-[#DC2626]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Columna 1 - Brand con logo */}
          <div>
            <div className="mb-4">
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Providence Fitness Logo" 
                className="h-12 w-auto mb-3"
              />
              
            </div>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Transforma tu cuerpo, eleva tu vida.<br />
              Únete a la revolución Providence hoy.
            </p>

            <div className="flex gap-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-[#DC2626] transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-[#DC2626] transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-[#DC2626] transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2 - Enlaces rápidos */}
          <div>
            <h3 className="text-[#FFFFFF] font-bold uppercase mb-6 tracking-wider text-lg">ENLACES RÁPIDOS</h3>
            <ul className="space-y-4">
              {["Inicio", "Nosotros", "Actividades", "Testimonios"].map((item) => (
                <li key={item}>
                  <Link 
                    href="#" 
                    className="text-gray-300 hover:text-white hover:underline transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - Programas */}
          <div>
            <h3 className="text-[#FFFFFF] font-bold uppercase mb-6 tracking-wider text-lg">PROGRAMAS</h3>
            <ul className="space-y-4">
              {["CrossFit", "Funcional", "HIIT", "Open Box"].map((program) => (
                <li key={program}>
                  <Link 
                    href="#" 
                    className="text-gray-300 hover:text-white hover:underline transition-colors text-sm"
                  >
                    {program}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4 - Contacto */}
          <div>
            <h3 className="text-[#FFFFFF] font-bold uppercase mb-6 tracking-wider text-lg">CONTACTO</h3>
            <ul className="space-y-5 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MailIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>info@providencefitness.com</span>
              </li>
              <li className="flex items-start gap-3">
                <LocationIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>Provincia de Buenos Aires 760</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria y derechos */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Providence Fitness. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};