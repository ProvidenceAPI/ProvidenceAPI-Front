"use client";

import { useAuth } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "src/components/Navbar";
import TransformacionCTA from "src/components/TransformacionCTA";
import { Footer } from "src/components/Footer";

// ✅ IMPORTAR DESDE LOS SERVICIOS
import { paymentService, isValidUUID, activityService } from "src/app/lib";
import { Payment } from "src/interfaces/Payments";
import { Activity } from "src/interfaces/Activity";

export default function MisPagosPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Estados
  const [pagos, setPagos] = useState<Payment[]>([])
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [activities,setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [warningMessage, setWarningMessage] = useState<string>("");

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated) {
    }
  }, [isAuthenticated]);

  // Verificar si viene desde MercadoPago con status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      
      if (status === 'approved') {
        setSuccessMessage('¡Pago aprobado exitosamente! Recargando historial...');
        setTimeout(() => {
          setSuccessMessage('');
          window.history.replaceState({}, '', '/mis-pagos');
        }, 2000);
      }
    }
  }, []);

  useEffect(()=>{
   const fetchReservations= async()=> {
      setIsLoading(true)
  
      try{
        const activities= await activityService.getActiveActivities()
        setActivities(activities)
        setIsLoading(false)
      }
      catch(error){
        console.error(error)
        setIsLoading(false)
      }
    }
      fetchReservations()
  },[])

  // ==========================================
  // FUNCIÓN PRINCIPAL DE PAGO
  // ==========================================

  const iniciarPagoMercadoPago = async () => {
    if (!selectedActivity) {
      setError("Por favor selecciona una actividad");
      return;
    }

    // ✅ Validación con helper de validación
    if (!isValidUUID(selectedActivity)) {
      setError(
        "La reserva seleccionada no tiene un ID válido. " +
        "No se puede procesar el pago. " +
        "Por favor contacta al administrador."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setWarningMessage("");

      console.log("=== INICIANDO PROCESO DE PAGO ===");
      console.log("Reservation ID (UUID):", selectedActivity);

    
      const initPoint = await paymentService.createPaymentPreference(
   selectedActivity
      );
      
      if (initPoint) {
        console.log("✅ Redirigiendo a MercadoPago:", initPoint);
        window.location.href = initPoint;
      } else {
        console.error("❌ No se recibió el link de pago");
        setError("No se pudo generar el link de pago. Por favor intenta nuevamente.");
      }
    } catch (error: any) {
      console.error("❌ Error en proceso de pago:", error);
      
      const errorMessage = error.message || "Error al procesar el pago. Por favor intenta nuevamente.";
      
      setError(errorMessage);
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
      cancelled: "Cancelado"
    };
    return estados[estado] || estado;
  };

  const descargarRecibo = async (pagoId: string) => {
    try {
      console.log("Descargando recibo:", pagoId);
      alert(`Funcionalidad de descarga de recibo #${pagoId} próximamente`);
    } catch (error) {
      console.error("Error descargando recibo:", error);
      alert("Error al descargar el recibo");
    }
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

  const actividadSeleccionada = activities.find(a => a.id === selectedActivity);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
   
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
          <p className="text-gray-600 mt-2">
            Historial y gestión de pagos
          </p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {activities.length === 0 
                        ? "No hay actividades disponibles" 
                        : "Seleccionar actividad"}
                    </option>
                    {activities.map((activities) => (
                      <option key={activities.id} value={activities.id}>
                        {activities.name}
                      </option>
                    ))}
                  </select>
                </div>


                {selectedActivity && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {actividadSeleccionada.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {actividadSeleccionada.description}
                    </p>
                    <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Horario:</span>
                        <span className="text-sm font-medium text-gray-700">
                          <ul>
                             {actividadSeleccionada.schedule.map((horario, index) => (
                              <li key={index}>{horario}</li>
                              ))}
                          </ul>

                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duración:</span>
                        <span className="text-sm text-gray-700">
                          {actividadSeleccionada.duration} minutos
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600">Precio:</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${parseFloat(actividadSeleccionada.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}


                <button
                  onClick={iniciarPagoMercadoPago}
                  disabled={!selectedActivity || isProcessing || activities.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      💳 Pagar con MercadoPago
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Serás redirigido a MercadoPago para completar el pago de forma segura
                </p>
              </div>
            </div>
          </div>


          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Historial de Pagos
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
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
                    {pagos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-400 text-5xl mb-3">📋</div>
                          <p className="text-gray-500 font-medium">No hay registros de pagos</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Tus pagos aparecerán aquí una vez que realices tu primera transacción
                          </p>
                        </td>
                      </tr>
                    ) : (
                      pagos.map((pago) => (
                        <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(pago.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pago.description}
                            </div>
                            {pago.mercadoPagoId && (
                              <div className="text-xs text-gray-500">
                                ID: {pago.mercadoPagoId}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pago.paymentMethod || 'MercadoPago'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${typeof pago.amount === 'number' ? pago.amount.toFixed(2) : parseFloat(pago.amount).toFixed(2)} {pago.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(pago.status)}`}>
                              {getEstadoTexto(pago.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => descargarRecibo(pago.id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Descargar recibo"
                              >
                                📄 Recibo
                              </button>
                            </div>
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

      <TransformacionCTA />
      <Footer />
    </div>
  );
}