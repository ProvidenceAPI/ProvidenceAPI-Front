"use client";

import { useAppContext } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import axios from "axios";
import { Navbar } from "src/components/Navbar";

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  actividad: string;
  estado: "confirmada" | "pendiente" | "cancelada";
  instructor: string;
  duracion: number;
  sala: string;
  usuarioId: string;
}

interface Actividad {
  id: string;
  nombre: string;
  descripcion: string;
  horarios: Array<{
    dia: string;
    hora: string;
    instructor: string;
    cupos: number;
  }>;
}

export default function MisReservasPage() {
  const { user, isAuthenticated, loading } = useAppContext();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActividad, setSelectedActividad] = useState<string>("");
  const [selectedHorario, setSelectedHorario] = useState<string>("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMisReservas();
      fetchActividades();
    }
  }, [isAuthenticated]);

  const fetchMisReservas = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('providence_token');
      
      // TODO: Cambiar por tu endpoint real del backend
      // const response = await axios.get('http://localhost:3000/reservas', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Datos mock para pruebas
      setReservas([
        { 
          id: "1", 
          fecha: "2024-01-20", 
          hora: "18:00", 
          actividad: "CrossFit", 
          estado: "confirmada", 
          instructor: "Carlos Ruiz",
          duracion: 60,
          sala: "Sala 1",
          usuarioId: user?.id || ""
        },
        { 
          id: "2", 
          fecha: "2024-01-21", 
          hora: "09:00", 
          actividad: "Yoga", 
          estado: "pendiente", 
          instructor: "Ana López",
          duracion: 45,
          sala: "Sala 2",
          usuarioId: user?.id || ""
        },
      ]);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActividades = async () => {
    try {
      // TODO: Cambiar por tu endpoint real
      // const response = await axios.get('http://localhost:3000/actividades');
      
      setActividades([
        {
          id: "1",
          nombre: "CrossFit",
          descripcion: "Entrenamiento funcional de alta intensidad",
          horarios: [
            { dia: "Lunes", hora: "18:00", instructor: "Carlos Ruiz", cupos: 10 },
            { dia: "Miércoles", hora: "18:00", instructor: "Carlos Ruiz", cupos: 8 },
            { dia: "Viernes", hora: "19:00", instructor: "Juan Pérez", cupos: 12 }
          ]
        },
        {
          id: "2",
          nombre: "Yoga",
          descripcion: "Clase de yoga para todos los niveles",
          horarios: [
            { dia: "Martes", hora: "09:00", instructor: "Ana López", cupos: 15 },
            { dia: "Jueves", hora: "09:00", instructor: "Ana López", cupos: 15 },
            { dia: "Sábado", hora: "10:00", instructor: "María García", cupos: 20 }
          ]
        }
      ]);
    } catch (error) {
      console.error("Error cargando actividades:", error);
    }
  };

  const cancelarReserva = async (id: string) => {
    try {
      const token = localStorage.getItem('providence_token');
      
      // TODO: Cambiar por tu endpoint real
      // await axios.delete(`http://localhost:3000/reservas/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Actualizar estado local
      setReservas(reservas.map(r => 
        r.id === id ? { ...r, estado: "cancelada" } : r
      ));
      
      alert("Reserva cancelada exitosamente");
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      alert("Error al cancelar la reserva");
    }
  };

  const crearReserva = async () => {
    if (!selectedActividad || !selectedHorario) {
      alert("Por favor selecciona una actividad y horario");
      return;
    }

    try {
      const token = localStorage.getItem('providence_token');
      
      // TODO: Cambiar por tu endpoint real
      // const response = await axios.post('http://localhost:3000/reservas', {
      //   actividadId: selectedActividad,
      //   horario: selectedHorario,
      //   usuarioId: user?.id
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Agregar nueva reserva a la lista
      const actividad = actividades.find(a => a.id === selectedActividad);
      const horarioInfo = actividad?.horarios.find(h => 
        `${h.dia} ${h.hora}` === selectedHorario
      );
      
      const nuevaReserva: Reserva = {
        id: Date.now().toString(),
        fecha: new Date().toISOString().split('T')[0],
        hora: horarioInfo?.hora || "",
        actividad: actividad?.nombre || "",
        estado: "pendiente",
        instructor: horarioInfo?.instructor || "",
        duracion: 60,
        sala: "Por asignar",
        usuarioId: user?.id || ""
      };
      
      setReservas([...reservas, nuevaReserva]);
      setSelectedActividad("");
      setSelectedHorario("");
      
      alert("Reserva creada exitosamente");
    } catch (error: any) {
      console.error("Error creando reserva:", error);
      alert(error.response?.data?.message || "Error al crear la reserva");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas tus reservas de actividades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario para nueva reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Nueva Reserva
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actividad
                  </label>
                  <select
                    value={selectedActividad}
                    onChange={(e) => setSelectedActividad(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Seleccionar actividad</option>
                    {actividades.map((actividad) => (
                      <option key={actividad.id} value={actividad.id}>
                        {actividad.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedActividad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario Disponible
                    </label>
                    <select
                      value={selectedHorario}
                      onChange={(e) => setSelectedHorario(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccionar horario</option>
                      {actividades
                        .find(a => a.id === selectedActividad)
                        ?.horarios.map((horario, index) => (
                          <option 
                            key={index} 
                            value={`${horario.dia} ${horario.hora}`}
                          >
                            {horario.dia} {horario.hora} - {horario.instructor} 
                            (Cupos: {horario.cupos})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={crearReserva}
                  disabled={!selectedActividad || !selectedHorario}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de reservas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actividad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor / Sala
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No tienes reservas aún
                        </td>
                      </tr>
                    ) : (
                      reservas.map((reserva) => (
                        <tr key={reserva.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(reserva.fecha).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reserva.hora} ({reserva.duracion} min)
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {reserva.actividad}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {reserva.instructor}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reserva.sala}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reserva.estado === "confirmada" 
                                ? "bg-green-100 text-green-800" 
                                : reserva.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            {reserva.estado === "pendiente" && (
                              <button
                                onClick={() => cancelarReserva(reserva.id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Cancelar
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">
                              Detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}