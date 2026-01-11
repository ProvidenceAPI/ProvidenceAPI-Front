"use client";

import { useAppContext } from "src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Script from "next/script";
import { Navbar } from "src/components/Navbar";
import TransformacionCTA from "src/components/TransformacionCTA";
import { Footer } from "src/components/Footer"; 

interface Pago {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  estado: "completado" | "pendiente" | "fallido";
  metodo: string;
  referencia: string;
  tipo: "mensualidad" | "clase" | "producto";
  descripcion: string;
}

interface ProductoPago {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: "mensualidad" | "clase" | "producto";
}

export default function MisPagosPage() {
  const { user, isAuthenticated, loading } = useAppContext();
  const router = useRouter();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [productos, setProductos] = useState<ProductoPago[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMisPagos();
      fetchProductos();
    }
  }, [isAuthenticated]);

  const fetchMisPagos = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('providence_token');
      
      // TODO: Cambiar por tu endpoint real
      // const response = await axios.get('http://localhost:3000/pagos', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Datos mock
      setPagos([
        { 
          id: "1", 
          fecha: "2024-01-10", 
          concepto: "Mensualidad Enero", 
          monto: 59.99, 
          estado: "completado", 
          metodo: "Tarjeta Visa", 
          referencia: "PAY-001",
          tipo: "mensualidad",
          descripcion: "Membresía mensual ilimitada"
        },
        { 
          id: "2", 
          fecha: "2024-01-15", 
          concepto: "Clase Personalizada", 
          monto: 25.00, 
          estado: "pendiente", 
          metodo: "MercadoPago", 
          referencia: "MP-001",
          tipo: "clase",
          descripcion: "Clase personalizada con instructor"
        },
      ]);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      // TODO: Cambiar por tu endpoint real
      setProductos([
        {
          id: "mensualidad-basica",
          nombre: "Membresía Básica",
          descripcion: "Acceso a todas las clases grupales",
          precio: 59.99,
          tipo: "mensualidad"
        },
        {
          id: "mensualidad-premium",
          nombre: "Membresía Premium",
          descripcion: "Acceso ilimitado + 2 clases personalizadas",
          precio: 89.99,
          tipo: "mensualidad"
        },
        {
          id: "clase-personal",
          nombre: "Clase Personalizada",
          descripcion: "1 hora con instructor personal",
          precio: 25.00,
          tipo: "clase"
        },
        {
          id: "pack-10-clases",
          nombre: "Pack 10 Clases",
          descripcion: "10 clases grupales (sin vencimiento)",
          precio: 199.99,
          tipo: "clase"
        }
      ]);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const iniciarPagoMercadoPago = async (productoId: string) => {
    try {
      setIsProcessing(true);
      const producto = productos.find(p => p.id === productoId);
      
      if (!producto) {
        alert("Producto no encontrado");
        return;
      }

      const token = localStorage.getItem('providence_token');
      
      // TODO: 1. Crear preferencia en tu backend
      // const response = await axios.post('http://localhost:3000/pagos/mercadopago', {
      //   productoId: producto.id,
      //   userId: user?.id,
      //   monto: producto.precio,
      //   descripcion: producto.nombre
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // TODO: 2. Redirigir a MercadoPago con el init_point de la respuesta
      // window.location.href = response.data.init_point;
      
      // Mock por ahora
      alert(`Simulación: Redirigiendo a MercadoPago para ${producto.nombre} - $${producto.precio}`);
      
      // Simular pago exitoso después de 2 segundos
      setTimeout(() => {
        const nuevoPago: Pago = {
          id: Date.now().toString(),
          fecha: new Date().toISOString().split('T')[0],
          concepto: producto.nombre,
          monto: producto.precio,
          estado: "completado",
          metodo: "MercadoPago",
          referencia: `MP-${Date.now()}`,
          tipo: producto.tipo,
          descripcion: producto.descripcion
        };
        
        setPagos([nuevoPago, ...pagos]);
        setSelectedProducto("");
        setIsProcessing(false);
        alert("¡Pago completado exitosamente!");
      }, 2000);

    } catch (error: any) {
      console.error("Error iniciando pago:", error);
      alert(error.response?.data?.message || "Error al procesar el pago");
      setIsProcessing(false);
    }
  };

  const descargarRecibo = async (pagoId: string) => {
    try {
      // TODO: Implementar descarga de recibo
      alert(`Descargando recibo #${pagoId}`);
    } catch (error) {
      console.error("Error descargando recibo:", error);
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
    <>
      {/* Script de MercadoPago (opcional, si usas SDK) */}
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="lazyOnload"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
            <p className="text-gray-600 mt-2">
              Historial y gestión de pagos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Productos para pagar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Realizar Pago
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Producto/Servicio
                    </label>
                    <select
                      value={selectedProducto}
                      onChange={(e) => setSelectedProducto(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} - ${producto.precio}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProducto && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {productos.find(p => p.id === selectedProducto)?.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {productos.find(p => p.id === selectedProducto)?.descripcion}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ${productos.find(p => p.id === selectedProducto)?.precio}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => iniciarPagoMercadoPago(selectedProducto)}
                    disabled={!selectedProducto || isProcessing}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
                        <span>💳</span>
                        <span className="ml-2">Pagar con MercadoPago</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Historial de pagos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Concepto
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
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No hay registros de pagos
                          </td>
                        </tr>
                      ) : (
                        pagos.map((pago) => (
                          <tr key={pago.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(pago.fecha).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {pago.concepto}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pago.descripcion}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {pago.metodo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${pago.monto.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                pago.estado === "completado" 
                                  ? "bg-green-100 text-green-800" 
                                  : pago.estado === "pendiente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                              <button
                                onClick={() => descargarRecibo(pago.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Recibo
                              </button>
                              {pago.estado === "pendiente" && (
                                <button className="text-green-600 hover:text-green-900">
                                  Reintentar
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
        </div>

        {/* Sección de Transformación CTA */}
        <TransformacionCTA />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}