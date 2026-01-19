"use client";

import { useAuth } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "src/components/Navbar";
import TransformacionCTA from "src/components/TransformacionCTA";
import { Footer } from "src/components/Footer";
import { Reservation } from "src/interfaces/Reservation";
import { reservationService } from "src/app/lib";

export default function MisReservasPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMisReservas();
    }
  }, [isAuthenticated, user]);

  const fetchMisReservas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
 
      const data = await reservationService.getUserReservations();
      
      setReservas(data);
    } catch (error: any) {
      console.error("Error cargando reservas:", error);
      setError(error.message || "Error al cargar tus reservas");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelarReserva = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      return;
    }

    try {
     
      await reservationService.cancelReservation(id);
      
      
      await fetchMisReservas();
      
      alert("Reserva cancelada exitosamente");
    } catch (error: any) {
      console.error("Error cancelando reserva:", error);
      alert(error.message || "Error al cancelar la reserva");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "confirmed":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoTexto = (estado: string) => {
    const estados: Record<string, string> = {
      active: "Activa",
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
      completed: "Completada"
    };
    return estados[estado] || estado;
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
       
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas tus reservas de actividades
          </p>
        </div>

      
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

       
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
                    Detalles
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
                      No tienes reservas aún. 
                      <a 
                        href="/home" 
                        className="text-red-600 hover:text-red-700 font-medium ml-1"
                      >
                        ¡Reserva tu primera clase!
                      </a>
                    </td>
                  </tr>
                ) : (
                  reservas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(reserva.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reserva.hour}
                          {reserva.activity?.duration && ` (${reserva.activity.duration} min)`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.activityName || reserva.activity?.name}
                        </div>
                        {reserva.isFree && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Clase Gratis
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Capacidad: {reserva.activity?.capacity || '-'}
                        </div>
                        {reserva.turn?.availableSpots !== undefined && (
                          <div className="text-sm text-gray-500">
                            Cupos disponibles: {reserva.turn.availableSpots}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(reserva.status)}`}>
                          {getEstadoTexto(reserva.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        {(reserva.status === "pending" || reserva.status === "active" || reserva.status === "confirmed") && (
                          <button
                            onClick={() => cancelarReserva(reserva.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                        {reserva.activity && (
                          <button 
                            onClick={() => router.push(`/actividades/${reserva.activityId}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver actividad
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <TransformacionCTA />


      <Footer />
    </div>
  );
}