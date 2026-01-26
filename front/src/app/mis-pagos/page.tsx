"use client";

import { useAppContext } from "src/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "src/hooks/useRequireAuth";
import Swal from "sweetalert2";
import { paymentService, isValidUUID, activityService } from "src/app/lib";
import { Payment } from "src/interfaces/Payments";
import { Activity } from "src/interfaces/Activity";

export default function MisPagosPage() {
  const { isAuthenticated, loading } = useAppContext();
  const router = useRouter();
  const { isLoading: isAuthLoading } = useRequireAuth("onlyUser");
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPaymentCard, setShowPaymentCard] = useState(false);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await paymentService.getPaymentHistory();
        setPagos(data);
      } catch {
        console.error("Error cargando pagos:", error);
      }
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
        setTimeout(async () => {
          const data = await paymentService.getPaymentHistory();
          setPagos(data);
          window.history.replaceState({}, "", "/mis-pagos");
        }, 1000);
      } else if (status === "rejected") {
        setError("El pago fue rechazado. Por favor intenta nuevamente.");
        setTimeout(() => {
          window.history.replaceState({}, "", "/mis-pagos");
        }, 3000);
      } else if (status === "pending") {
        setWarningMessage(
          "Tu pago está pendiente de confirmación. Te notificaremos cuando se apruebe.",
        );
        setTimeout(() => {
          window.history.replaceState({}, "", "/mis-pagos");
        }, 3000);
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
        setError("Error al cargar las actividades");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  if (isAuthLoading) return <div>Cargando...</div>;

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
          window.open(initPoint, "_blank");
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
  const pagosFiltrados = pagos.filter((pago) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "rejected") {
      return pago.status === "rejected" || pago.status === "cancelled";
    }
    return pago.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* HEADER Y BOTÓN ALINEADOS */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💳 Mis Pagos</h1>
            <p className="text-gray-600 mt-2">Historial y gestión de pagos</p>
          </div>
          <button
            onClick={() => setShowPaymentCard(!showPaymentCard)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
          >
            {showPaymentCard ? (
              <>❌ Cancelar Pago</>
            ) : (
              <>💳 Realizar Nuevo Pago</>
            )}
          </button>
        </div>
        {/* MENSAJES */}
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
        {/* CARD DE PAGO DESPLEGABLE */}
        {showPaymentCard && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              💳 Realizar Pago
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Actividad
                </label>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  disabled={isProcessing || activities.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {activities.length === 0
                      ? "No hay actividades disponibles"
                      : "Seleccionar actividad"}
                  </option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} - $
                      {Number(activity.price).toLocaleString("es-AR")}
                    </option>
                  ))}
                </select>
              </div>
              {selectedActivity && actividadSeleccionada && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {actividadSeleccionada.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {actividadSeleccionada.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total a pagar:
                      </span>
                      <span className="text-3xl font-bold text-blue-600">
                        $
                        {Number(actividadSeleccionada.price).toLocaleString(
                          "es-AR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={iniciarPagoMercadoPago}
                  disabled={!selectedActivity || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {isProcessing ? "Procesando..." : "💳 Pagar con MercadoPago"}
                </button>
                <button
                  onClick={() => {
                    setShowPaymentCard(false);
                    setSelectedActivity("");
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* HISTORIAL DE PAGOS */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                📋 Historial de Pagos
              </h2>
              {/* FILTROS */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === "approved"
                      ? "bg-green-600 text-white"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  ✅ Aprobados
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === "pending"
                      ? "bg-yellow-600 text-white"
                      : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  }`}
                >
                  ⏳ Pendientes
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === "rejected"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  ❌ Rechazados
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
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
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="text-4xl mb-2">📭</div>
                      {statusFilter === "all"
                        ? "No hay registros de pagos"
                        : `No hay pagos ${getEstadoTexto(statusFilter).toLowerCase()}`}
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((pago) => (
                    <tr
                      key={pago.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pago.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {pago.activity?.name || "Actividad eliminada"}
                        </div>
                        {pago.mercadoPagoId && (
                          <div className="text-xs text-gray-500">
                            ID: {pago.mercadoPagoId.slice(0, 10)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        💳 MercadoPago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${Number(pago.amount).toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            pago.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : pago.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pago.status === "approved" && "✅ "}
                          {pago.status === "pending" && "⏳ "}
                          {(pago.status === "rejected" ||
                            pago.status === "cancelled") &&
                            "❌ "}
                          {getEstadoTexto(pago.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => descargarRecibo(pago.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
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
  );
}
