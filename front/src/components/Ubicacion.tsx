"use client";

import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import dynamic from 'next/dynamic';

const MapaReal = dynamic(() => import('src/components/MapaReal'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-xl animate-pulse"></div>
  )
});

export default function Ubicacion() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      
      {/* HEADER */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          Nuestra ubicación
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          Encuéntranos fácilmente en Unicenter Shopping. Te ayudamos a llegar.
        </p>
      </div>
      
      {/* GRID RESPONSIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* COLUMNA IZQUIERDA - INFORMACIÓN */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* CARD DIRECCIÓN Y CONTACTO */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
            {/* DIRECCIÓN */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="bg-red-100 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                  Dirección
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Paraná 3745, Martínez<br />
                  Buenos Aires, Argentina
                </p>
              </div>
            </div>
            
            {/* TELÉFONO Y EMAIL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-gray-100">
              {/* TELÉFONO */}
              <div>
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Phone className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">Teléfono</span>
                </div>
                <a 
                  href="tel:+541134567890" 
                  className="text-gray-700 hover:text-red-600 transition-colors text-xs sm:text-sm break-all"
                >
                  (11) 3456-7890
                </a>
              </div>
              
              {/* EMAIL */}
              <div>
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Mail className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">Email</span>
                </div>
                <a 
                  href="mailto:info@providence.com" 
                  className="text-gray-700 hover:text-red-600 transition-colors text-xs sm:text-sm break-all"
                >
                  info@providence.com
                </a>
              </div>
            </div>
          </div>
          
          {/* CARD HORARIOS */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-red-100 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                Horarios
              </h3>
            </div>
            
            <div className="space-y-2">
              {[
                { dia: "Lunes a Viernes", hora: "7:00 - 22:00" },
                { dia: "Sábados", hora: "9:00 - 14:00" },
                { dia: "Domingos", hora: "10:00 - 13:00" },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center py-2 sm:py-2.5 px-2 sm:px-3 bg-gray-50 rounded-lg gap-2"
                >
                  <span className="font-medium text-gray-700 text-xs sm:text-sm">
                    {item.dia}
                  </span>
                  <span className="font-semibold text-red-600 text-xs sm:text-sm flex-shrink-0">
                    {item.hora}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* CARD BENEFICIOS */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 sm:p-5 border border-red-200">
            <h4 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
              Beneficios para miembros
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                <span>Estacionamiento gratuito</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                <span>Acceso a lockers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                <span>Toallas incluidas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                <span>WiFi de alta velocidad</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* COLUMNA DERECHA - MAPA */}
        <div className="h-96 sm:h-[450px] md:h-[600px] lg:h-auto">
          <div className="sticky top-4 sm:top-6 md:top-8">
            <MapaReal />
          </div>
        </div>
      </div>
    </main>
  );
}