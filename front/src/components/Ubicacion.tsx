"use client";

import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import dynamic from 'next/dynamic';

const MapaReal = dynamic(() => import('src/components/MapaReal'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse"></div>
  )
});

export default function Ubicacion() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header minimalista */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Nuestra ubicación</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Encuéntranos fácilmente en Unicenter Shopping. Te ayudamos a llegar.
        </p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Información de contacto - COMPACTA */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-100 p-2.5 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Dirección</h3>
                <p className="text-gray-700">
                  Paraná 3745, Martínez<br />
                  Buenos Aires, Argentina
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">Teléfono</span>
                </div>
                <a href="tel:+541134567890" className="text-gray-700 hover:text-red-600">
                  (11) 3456-7890
                </a>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">Email</span>
                </div>
                <a href="mailto:info@providence.com" className="text-gray-700 hover:text-red-600 text-sm">
                  info@providence.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Horarios */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-lg">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Horarios</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { dia: "Lunes a Viernes", hora: "7:00 - 22:00" },
                { dia: "Sábados", hora: "9:00 - 14:00" },
                { dia: "Domingos", hora: "10:00 - 13:00" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{item.dia}</span>
                  <span className="font-semibold text-red-600">{item.hora}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Beneficios */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-200">
            <h4 className="font-semibold text-gray-900 mb-3">Beneficios para miembros</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Estacionamiento gratuito
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Acceso a lockers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Toallas incluidas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                WiFi de alta velocidad
              </li>
            </ul>
          </div>
        </div>
        
        {/* Mapa interactivo */}
        <div>
          <MapaReal />
        </div>
      </div>
    </main>
  );
}