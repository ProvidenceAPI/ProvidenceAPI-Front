// app/ubicacion/page.tsx

import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Navigation, 
} from 'lucide-react';

export default function Ubicacion() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Título Principal - IDÉNTICO a "Historias de Éxito" */}
        <div className="text-center mb-16">
          <h1 className="text-5xl  text-gray-900 mb-6 tracking-tight">
            UBICACIÓN
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
            Encuéntranos fácilmente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Información de Contacto - Estilo más minimalista */}
          <div className="space-y-12">
            
            {/* Dirección */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                <div className="bg-gray-100 p-3 rounded-full">
                  <MapPin className="h-7 w-7 text-gray-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Dirección</h2>
              </div>
              <p className="text-xl text-gray-800 leading-relaxed pl-16">
                Provincia de Buenos Aires 760,<br />
                Cipoletti, Argentina
              </p>
              <a 
                href="https://maps.google.com/?q=Provincia+de+Buenos+Aires+760,Cipoletti,Río+Negro,Argentina"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center ml-16 text-gray-700 hover:text-gray-900 font-medium text-lg transition-colors"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Ver en Google Maps
              </a>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-300 pt-8"></div>

            {/* Teléfono */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Phone className="h-7 w-7 text-gray-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Teléfono</h2>
              </div>
              <a 
                href="tel:+5551234567"
                className="text-xl text-gray-800 hover:text-gray-900 transition-colors block pl-16"
              >
                (555) 123-4567
              </a>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-300 pt-8"></div>

            {/* Email */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Mail className="h-7 w-7 text-gray-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Email</h2>
              </div>
              <a 
                href="mailto:info@providencefitness.com"
                className="text-xl text-gray-800 hover:text-gray-900 transition-colors block pl-16"
              >
                info@providencefitness.com
              </a>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-300 pt-8"></div>

            {/* Horarios */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Clock className="h-7 w-7 text-gray-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Horarios</h2>
              </div>
              <div className="space-y-3 pl-16">
                <p className="text-xl text-gray-800">
                  <span className="font-semibold">Lunes a Viernes:</span> 07:00 - 22:00
                </p>
                <p className="text-xl text-gray-800">
                  <span className="font-semibold">Sábados:</span> 09:00 - 14:00
                </p>
                <p className="text-gray-600 text-lg mt-4">
                  * Domingo cerrado
                </p>
              </div>
            </div>
          </div>

          {/* Mapa y Features */}
          <div className="space-y-8">
            
            {/* Mapa */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-96 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.142651098254!2d-67.99811192367717!3d-38.93385437170407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x960a33c3e8e4a26d%3A0xb8a3d83681c00a74!2sProvincia%20de%20Buenos%20Aires%20760%2C%20Cipoletti%2C%20R%C3%ADo%20Negro!5e0!3m2!1ses-419!2sar!4v1704675200000!5m2!1ses-419!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Providence Fitness"
                  className="rounded-xl"
                />
              </div>
            </div>

            

            
          </div>
        </div>

       
      </div>
    </div>
  );
}