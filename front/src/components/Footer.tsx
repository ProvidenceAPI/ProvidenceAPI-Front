import React from "react";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, TwitterIcon, WhatsAppIcon } from "./SocialIcons";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Columna 1: Brand */}
          <div>
            <h2 className="text-2xl font-bold tracking-[0.2em] mb-4">
              <span className="text-white">PROVID</span>
              <span className="text-[#DC2626]">E</span>
              <span className="text-white">NCE</span>
            </h2>
            <p className="text-gray-400 text-sm mb-2">FITNESS</p>
            <p className="text-gray-400 text-sm mb-6">
              Transforma tu cuerpo, eleva tu vida.<br />
              Únete a la revolución Providence hoy.
            </p>
          </div>

              
            
                   
                        

                              {/* Iconos de las redes */}
                              <div className="flex gap-4 mt-4">
                                <a
                                  href="https://wa.me/15551234567"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-green-500 transition-all duration-300 hover:scale-110"
                                  aria-label="WhatsApp"
                                >
                                  <WhatsAppIcon className="w-5 h-5" />
                                </a>
                                <a
                                  href="https://facebook.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-500 transition-all duration-300 hover:scale-110"
                                  aria-label="Facebook"
                                >
                                  <FacebookIcon className="w-5 h-5" />
                                </a>
                                <a
                                  href="https://instagram.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-pink-500 transition-all duration-300 hover:scale-110"
                                  aria-label="Instagram"
                                >
                                  <InstagramIcon className="w-5 h-5" />
                                </a>
                                <a
                                  href="https://twitter.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110"
                                  aria-label="Twitter"
                                >
                                  <TwitterIcon className="w-5 h-5" />
                                </a>
                              </div>
                            </div>

                            {/* Columna 2: Enlaces Rápidos */}
                            <div>
                              <h3 className="text-[#DC2626] font-bold uppercase mb-4 tracking-wide text-lg">ENLACES RÁPIDOS</h3>
                              <ul className="space-y-3">
                                {["Inicio", "Nosotros", "Actividades", "Testimonios"].map((item) => (
                                  <li key={item}>
                                    <Link
                                      href="/"
                                      className="text-gray-300 hover:text-white hover:underline transition-colors duration-200"
                                    >
                                      {item}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Columna 3: Programas */}
                            <div>
                              <h3 className="text-[#DC2626] font-bold uppercase mb-4 tracking-wide text-lg">PROGRAMAS</h3>
                              <ul className="space-y-3">
                                {["CrossFit", "Functional", "HIIT", "Open Box"].map((program) => (
                                  <li key={program}>
                                    <Link
                                      href="/"
                                      className="text-gray-300 hover:text-white hover:underline transition-colors duration-200"
                                    >
                                      {program}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Columna 4: Contacto */}
                            <div>
                              <h3 className="text-[#DC2626] font-bold uppercase mb-4 tracking-wide text-lg">CONTACTO</h3>
                              <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start">
                                  <span className="mr-2">📞</span>
                                  <span>(555) 123-4567</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="mr-2">✉️</span>
                                  <span>info@providencefitness.com</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="mr-2">📍</span>
                                  <span>Provincia de Buenos Aires 760</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          
                                <p className="text-gray-500 text-sm">
                                  &copy; {currentYear} Providence Fitness. Todos los derechos reservados.
                                </p>
                              

                              </div>
                      
                      
                    );
                  };
