"use client";

import { 
  Car, 
  Bike, 
  Footprints,
  Bus,
  Navigation
} from "lucide-react";

const GIMNASIO_COORDS = {
  lat: -34.5081762,
  lng: -58.527121,
};

// Función SIMPLE que sí funciona
const abrirRutaGoogleMaps = (modo: string) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${GIMNASIO_COORDS.lat},${GIMNASIO_COORDS.lng}&travelmode=${modo}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function MapaReal() {
  return (
    <div className="space-y-3 sm:space-y-4">
      
      {/* TÍTULO */}
      <div className="text-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
          Cómo llegar
        </h2>
      </div>

      {/* BOTONES DE TRANSPORTE - RESPONSIVE */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {/* BOTÓN AUTO */}
        <button
          onClick={() => abrirRutaGoogleMaps('driving')}
          className="p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors flex flex-col items-center justify-center gap-1 sm:gap-2"
          title="Ir en auto"
        >
          <Car className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
          <span className="text-xs text-gray-700 text-center">Auto</span>
        </button>

        {/* BOTÓN CAMINAR */}
        <button
          onClick={() => abrirRutaGoogleMaps('walking')}
          className="p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors flex flex-col items-center justify-center gap-1 sm:gap-2"
          title="Ir caminando"
        >
          <Footprints className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
          <span className="text-xs text-gray-700 text-center">Caminar</span>
        </button>

        {/* BOTÓN BICICLETA */}
        <button
          onClick={() => abrirRutaGoogleMaps('bicycling')}
          className="p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors flex flex-col items-center justify-center gap-1 sm:gap-2"
          title="Ir en bicicleta"
        >
          <Bike className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
          <span className="text-xs text-gray-700 text-center">Bici</span>
        </button>

        {/* BOTÓN BUS */}
        <button
          onClick={() => abrirRutaGoogleMaps('transit')}
          className="p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors flex flex-col items-center justify-center gap-1 sm:gap-2"
          title="Ir en transporte público"
        >
          <Bus className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600" />
          <span className="text-xs text-gray-700 text-center">Bus</span>
        </button>
      </div>

      {/* MAPA - RESPONSIVE */}
      <div className="h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3287.102218611716!2d-58.5271209!3d-34.5081762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb0ee292497e9%3A0xf9a611e58747f528!2sUnicenter%20Shopping!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Providence Fitness"
        />
      </div>

      {/* BOTÓN PRINCIPAL "CÓMO LLEGAR" - RESPONSIVE */}
      <button
        onClick={() => abrirRutaGoogleMaps('driving')}
        className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
      >
        <Navigation className="h-4 sm:h-5 w-4 sm:w-5" />
        <span>Cómo llegar</span>
      </button>
    </div>
  );
}