"use client";

import { useAppContext } from "src/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Reservation } from "src/interfaces/Reservation";
import { reservationService } from "src/app/lib";
import Swal from "sweetalert2";

export default function MisReservasPage() {
  const { user, isAuthenticated, loading } = useAppContext();
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
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar esta reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, volver",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await reservationService.cancelReservation(id);

      await fetchMisReservas();

      Swal.fire({
        title: "¡Cancelada!",
        text: "Reserva cancelada exitosamente",
        icon: "success",
        confirmButtonColor: "#dc2626",
      });
    } catch (error: any) {
      console.error("Error cancelando reserva:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Error al cancelar la reserva",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const formatearFecha = (fechaString: string) => {
    const [year, month, day] = fechaString.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);

    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const formatearHora = (horaString: string) => {
    if (!horaString) return "-";
    const [horas, minutos] = horaString.split(":");
    return `${horas}:${minutos}`;
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
      completed: "Completada",
    };
    return estados[estado] || estado;
  };

  const getActivitySlug = (name: string): string => {
    if (!name) return "";
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  const getVerActividadHref = (reserva: Reservation): string => {
    const name = reserva.activity?.name;
    if (!name) return "/home";

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    return `/activities/${slug}`;
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
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
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
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {formatearFecha(reserva.activityDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatearHora(reserva.startTime)}
                          {reserva.endTime &&
                            ` - ${formatearHora(reserva.endTime)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.activity.name}
                        </div>
                        {reserva.turn?.isFreeTrial && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Clase Gratis
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Capacidad: {reserva.activity.capacity || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cupos disponibles:{" "}
                          {reserva.turn?.availableSpots ?? "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(reserva.status)}`}
                        >
                          {getEstadoTexto(reserva.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        {(reserva.status === "pending" ||
                          reserva.status === "active" ||
                          reserva.status === "confirmed") && (
                          <button
                            onClick={() => cancelarReserva(reserva.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                        {(reserva.activityId || reserva.activity.name) && (
                          <button
                            onClick={() =>
                              router.push(getVerActividadHref(reserva))
                            }
                            className="text-blue-600 hover:text-blue-900 font-medium"
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
    </div>
  );
}
