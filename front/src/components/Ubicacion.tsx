import { MapPin, Phone, Mail, Clock, Navigation, Star } from "lucide-react";

export default function Ubicacion() {
  return (
    <main>
      <section className="py-16 px-6 md:px-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
          UBICACIÓN
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Visítanos en nuestro gimnasio principal en Unicenter Shopping
        </p>
      </section>
      
      {/* Contenedor principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Columna izquierda - Tarjetas compactas */}
          <div className="space-y-5">
            {/* Dirección */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-red-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Dirección
                  </h3>
                  <p className="text-gray-800 mb-3 leading-relaxed">
                    Paraná, 3745, Provincia de Buenos Aires 
                    <br />
                    Martínez, Argentina
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Unicenter+Shopping/@-34.5081762,-58.527121,17z/data=!3m1!4b1!4m6!3m5!1s0x95bcb0ee292497e9:0xf9a611e58747f528!8m2!3d-34.5081762!4d-58.527121!16zL20vMGY4NXpk?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-red-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2">Teléfono</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <a
                      href="tel:+5551234567"
                      className="text-gray-800 hover:text-red-600 text-lg font-medium transition-colors"
                    >
                      (555) 123-4567
                    </a>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                      <Star className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Disponible
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Atendemos de Lunes a Sábado
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-red-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a
                    href="mailto:providenceapi@gmail.com"
                    className="text-gray-800 hover:text-red-600 text-lg font-medium transition-colors block mb-3"
                  >
                    providenceapi@gmail.com
                  </a>
                  <p className="text-gray-500 text-sm">
                    Respondemos en menos de 24 horas
                  </p>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:border-red-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-red-50 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2">Horarios</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">
                        Lunes a Viernes
                      </span>
                      <span className="font-semibold text-red-600">
                        07:00 - 22:00
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">Sábados</span>
                      <span className="font-semibold text-red-600">
                        09:00 - 14:00
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded px-3 py-2">
                    <p className="text-gray-600 text-sm text-center">
                      <span className="font-medium">* Domingo cerrado</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Mapa */}
          <div className="h-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
              {/* Mapa simplificado  */}
              <div className="h-[500px] md:h-[600px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3287.102218611716!2d-58.5271209!3d-34.5081762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb0ee292497e9%3A0xf9a611e58747f528!2sUnicenter%20Shopping!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Providence Fitness - Unicenter Shopping"
                />
              </div>
            </div>

            {/* Información adicional pequeña */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white p-1.5 rounded">
                    <span className="text-gray-700 text-sm">🚗</span>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    Estacionamiento
                  </h4>
                </div>
                <p className="text-gray-600 text-xs">Gratuito para miembros</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white p-1.5 rounded">
                    <span className="text-gray-700 text-sm">🚌</span>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    Transporte
                  </h4>
                </div>
                <p className="text-gray-600 text-xs">Acceso por bus</p>
              </div>
            </div>

            {/* Botón pequeño */}
            <div className="mt-6">
              <a
                href="https://maps.app.goo.gl/?link=https://www.google.com/maps/place/Unicenter+Shopping/@-34.5081762,-58.5271209,17z/data=!3m1!4b1!4m6!3m5!1s0x95bcb0ee292497e9:0xf9a611e58747f528!8m2!3d-34.5081762!4d-58.5271209!16s%2Fg%2F11b8z5vxj3?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-lg text-center transition-colors text-sm"
              >
                Obtener direcciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}