"use client";

import { FaLinkedin, FaGithub, FaGlobe, FaDumbbell, FaCalendarAlt, FaCreditCard, FaMapMarkerAlt, FaBell, FaUsers, FaChartLine } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import Image from "next/image";

const teamMembers = [
  {
    name: "Molina Laila Nahir",
    role: "Desarrolladora Frontend",
    linkedin: "#",
    github: "#",
    email: "#",
    image: "/image/team/lai.png", 
  },
  {
    name: "Cañon Nieto Luz Adriana",
    role: "Desarrolladora Backend",
    linkedin: "#",
    github: "#",
    email: "#",
    image: "/image/team/luza.png",
  },
  {
    name: "Bartoli Sofía Desiree",
    role: "Desarrolladora Backend",
    linkedin: "#",
    github: "#",
    email: "#",
    image: "/image/team/sofi.png",
  },
];

const features = [
  { icon: <FaDumbbell />, title: "Gestión Multiactividad", desc: "Control de múltiples disciplinas en un solo lugar" },
  { icon: <FaCalendarAlt />, title: "Reservas Inteligentes", desc: "Sistema de turnos con control de cupos en tiempo real" },
  { icon: <FaCreditCard />, title: "Pagos Específicos", desc: "Ciclos de pago independientes por cada actividad" },
  { icon: <FaMapMarkerAlt />, title: "Integración Maps", desc: "Geolocalización optimizada para usuarios" },
  { icon: <FaBell />, title: "Notificaciones Automáticas", desc: "Recordatorios de turnos y alertas de vencimiento" },
  { icon: <FaUsers />, title: "Gestión de Clientes", desc: "Perfiles completos y seguimiento personalizado" },
  { icon: <FaChartLine />, title: "Dashboard Avanzado", desc: "Análisis y métricas para administradores" },
];

export default function NosotrosFooter() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Sección principal */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Descripción de la plataforma Fitness */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#DC2626]/10 to-transparent rounded-full border border-[#DC2626]/30">
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C]"></div>
                <span className="text-sm font-medium tracking-wider text-white">PROVIDENCE FITNESS</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Transformamos la gestión
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#B91C1C] mt-2">
                  fitness digital
                </span>
              </h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed text-lg">
                <span className="font-semibold text-white">Providence Fitness</span> es una plataforma integral 
                diseñada específicamente para <span className="text-white font-medium">gimnasios de pequeña y 
                mediana escala</span> que ofrecen múltiples actividades grupales y entrenamientos personalizados.
              </p>
              
              <p className="text-gray-300 leading-relaxed">
                Nuestra solución nace para resolver los desafíos operativos que enfrentan los establecimientos 
                fitness: gestión manual de reservas, problemas de control de cupos, sistemas de pago 
                desactualizados y una experiencia fragmentada para usuarios y administradores.
              </p>
              
              <div className="bg-gradient-to-r from-[#1a1a1a] to-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center">
                      <FaDumbbell className="text-white text-xl" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2">Nuestro valor diferenciador</h4>
                    <p className="text-gray-300">
                      Un enfoque específico para gimnasios multiactividad donde cada usuario puede suscribirse 
                      simultáneamente a diferentes disciplinas, cada una con su ciclo de pago mensual independiente, 
                      todo centralizado en una plataforma intuitiva y escalable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Características principales */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-0.5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C]"></div>
                <h2 className="text-2xl font-bold text-white">FUNCIONALIDADES CLAVE</h2>
              </div>
              <p className="text-gray-400">
                Todo lo que necesitas para gestionar tu gimnasio eficientemente
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-gradient-to-br from-gray-900 to-black rounded-xl p-5 border border-gray-800 hover:border-[#B91C1C] transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#DC2626]/20 to-[#B91C1C]/10 flex items-center justify-center group-hover:from-[#DC2626]/30 group-hover:to-[#B91C1C]/20 transition-all">
                        <div className="text-[#DC2626] group-hover:text-[#B91C1C] text-lg transition-colors">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-sm">{feature.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección del equipo */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-0.5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C]"></div>
              <h2 className="text-2xl font-bold text-white">EL EQUIPO DETRÁS DE PROVIDENCE FITNESS</h2>
              <div className="w-10 h-0.5 bg-gradient-to-r from-[#B91C1C] to-[#DC2626]"></div>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Un equipo apasionado por la tecnología y el fitness, comprometido con la excelencia
            </p>
          </div>
          
          {/* Tarjetas del equipo */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 border border-gray-800 hover:border-[#B91C1C] transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/20 group transform hover:-translate-y-2"
                >
                  <div className="text-center space-y-5">
                    {/* Avatar con imagen */}
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-[#B91C1C] transition-all duration-300 mb-2 relative">
                        {/* Fallback si no hay imagen */}
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={`Foto de ${member.name}`}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            priority={index < 3} 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center text-white text-2xl font-bold">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Información del miembro */}
                    <div>
                      <h3 className="font-bold text-white text-xl mb-2 leading-tight">{member.name}</h3>
                      <p className="text-gray-300 mb-1 font-medium">{member.role}</p>
                      <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#DC2626]/10 to-[#B91C1C]/5 rounded-full border border-[#DC2626]/20 text-sm text-gray-300">
                        Providence Team
                      </div>
                    </div>
                    
                    {/* Redes sociales */}
                    <div className="flex justify-center gap-4 pt-4 border-t border-gray-800">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-[#0077B5] hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                        aria-label={`LinkedIn de ${member.name}`}
                      >
                        <FaLinkedin size={18} />
                      </a>
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                        aria-label={`GitHub de ${member.name}`}
                      >
                        <FaGithub size={18} />
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-[#EA4335] hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                        aria-label={`Email de ${member.name}`}
                      >
                        <SiGmail size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Separador decorativo */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-6 bg-gradient-to-b from-gray-900 to-black">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center">
                <FaDumbbell className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Información de contacto y tecnologías */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Tecnologías */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaDumbbell className="text-[#DC2626] text-xl" />
                <h3 className="text-xl font-bold text-white">TECNOLOGÍAS IMPLEMENTADAS</h3>
              </div>
              <p className="text-gray-400">
                Stack tecnológico moderno y robusto para máxima performance
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {[
                { tech: "React", color: "from-blue-500/20 to-cyan-500/20" },
                { tech: "Next.js", color: "from-gray-800 to-black" },
                { tech: "TypeScript", color: "from-blue-600/20 to-blue-700/20" },
                { tech: "Tailwind CSS", color: "from-teal-500/20 to-cyan-500/20" },
                { tech: "Node.js", color: "from-green-600/20 to-emerald-500/20" },
                { tech: "Nest.js", color: "from-green-700/20 to-green-600/20" },
                { tech: "Google Maps API", color: "from-red-500/20 to-red-600/20" },
              ].map((item, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-lg bg-gradient-to-r ${item.color} border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-all duration-300 text-sm font-medium`}
                >
                  {item.tech}
                </span>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C]"></div>
                <h3 className="text-xl font-bold text-white">CONTACTO PROFESIONAL</h3>
              </div>
              <p className="text-gray-400">
                ¿Eres propietario de un gimnasio o estás interesado en nuestra solución?
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-6 border border-gray-800">
              <div className="space-y-4">
                <a
                  href="mailto:providenceapi@gmail.com"
                  className="inline-flex items-center gap-3 text-lg text-white hover:text-[#B91C1C] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <SiGmail className="text-white" />
                  </div>
                  <div>
                    <span className="font-medium">providenceapi@gmail.com</span>
                    <p className="text-gray-400 text-sm mt-1">Respuesta en menos de 24 horas</p>
                  </div>
                </a>
                
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-300">
                    Especialistas en digitalización y optimización de gestión deportiva
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Implementación personalizada según las necesidades de tu establecimiento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}