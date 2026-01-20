"use client";

import { useAppContext } from "src/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Swal from "sweetalert2";

import { paymentService, isValidUUID, activityService } from "src/app/lib";
import { Payment } from "src/interfaces/Payments";
import { Activity } from "src/interfaces/Activity";

export default function MisPagosPage() {
  const { isAuthenticated, loading } = useAppContext();
  const router = useRouter();

  const [pagos, setPagos] = useState<Payment[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string>("");

  useEffect(() => {
    const loadPayments = async () => {
      const data = await paymentService.getPaymentHistory();
      setPagos(data);
    };
    loadPayments();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        confirmButtonColor: "#dc2626",
      });
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: successMessage,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }, [successMessage]);

  useEffect(() => {
    if (warningMessage) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: warningMessage,
        confirmButtonColor: "#f59e0b",
      });
    }
  }, [warningMessage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");

      if (status === "approved") {
        setSuccessMessage(
          "¡Pago aprobado exitosamente! Recargando historial...",
        );
        setTimeout(() => {
          window.history.replaceState({}, "", "/mis-pagos");
        }, 2000);
      }
    }
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const activities = await activityService.getActiveActivities();
        setActivities(activities);
      } catch (error) {
        console.error(error);
        setError("Error al cargar las actividades");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const iniciarPagoMercadoPago = async () => {
    if (!selectedActivity) {
      setError("Por favor selecciona una actividad");
      return;
    }

    if (!isValidUUID(selectedActivity)) {
      setError(
        "La reserva seleccionada no tiene un ID válido. Por favor contacta al administrador.",
      );
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setWarningMessage("");

      const initPoint =
        await paymentService.createPaymentPreference(selectedActivity);

      if (initPoint) {
        Swal.fire({
          icon: "info",
          title: "Redirigiendo a MercadoPago",
          text: "Serás redirigido para completar el pago",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = initPoint;
        });
      } else {
        setError("No se pudo generar el link de pago. Intenta nuevamente.");
      }
    } catch (error: any) {
      setError(
        error.message ||
          "Error al procesar el pago. Por favor intenta nuevamente.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoTexto = (estado: string) => {
    const estados: Record<string, string> = {
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
      cancelled: "Cancelado",
    };
    return estados[estado] || estado;
  };

  const descargarRecibo = async (pagoId: string) => {
    Swal.fire({
      icon: "info",
      title: "Próximamente",
      text: `La descarga del recibo #${pagoId} estará disponible pronto`,
      confirmButtonColor: "#2563eb",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <div className="text-lg text-gray-700">Cargando...</div>
        </div>
      </div>
    );
  }

  const actividadSeleccionada = activities.find(
    (a) => a.id === selectedActivity,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
          <p className="text-gray-600 mt-2">Historial y gestión de pagos</p>
        </div>
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start">
              <span className="text-green-600 text-xl mr-2">✅</span>
              <div>
                <h3 className="text-green-800 font-medium">¡Éxito!</h3>
                <p className="text-green-700 text-sm mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        {warningMessage && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-yellow-600 text-xl mr-2">⚠️</span>
              <div>
                <h3 className="text-yellow-800 font-medium">Atención</h3>
                <p className="text-yellow-700 text-sm mt-1">{warningMessage}</p>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-red-600 text-xl mr-2">❌</span>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PANEL IZQUIERDO */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Realizar Pago
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Seleccionar Actividad
                  </label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    disabled={isProcessing || activities.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">
                      {activities.length === 0
                        ? "No hay actividades disponibles"
                        : "Seleccionar actividad"}
                    </option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedActivity && actividadSeleccionada && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {actividadSeleccionada.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {actividadSeleccionada.description}
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {actividadSeleccionada.schedule.map((horario, index) => (
                        <li key={index}>🕒 {horario}</li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between">
                      <span>Duración:</span>
                      <span>{actividadSeleccionada.duration} min</span>
                    </div>
                    <div className="mt-2 flex justify-between font-bold">
                      <span>Precio:</span>
                      <span>
                        ${Number(actividadSeleccionada.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  onClick={iniciarPagoMercadoPago}
                  disabled={!selectedActivity || isProcessing}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
                >
                  {isProcessing ? "Procesando..." : "💳 Pagar con MercadoPago"}
                </button>
              </div>
            </div>
          </div>
          {/* PANEL DERECHO */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Historial de Pagos
                </h2>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {pagos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        No hay registros de pagos
                      </td>
                    </tr>
                  ) : (
                    pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {new Date(pago.createdAt).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4">
                          Suscripción
                          {pago.mercadoPagoId && (
                            <div className="text-xs text-gray-500">
                              MP ID: {pago.mercadoPagoId}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">MercadoPago</td>
                        <td className="px-6 py-4">
                          ${Number(pago.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {getEstadoTexto(pago.status)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => descargarRecibo(pago.id)}
                            className="text-blue-600"
                          >
                            📄 Recibo
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
  );
}
