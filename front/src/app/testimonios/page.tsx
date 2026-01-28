"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "src/contexts/AppContext";
import { testimonialService } from "src/app/lib";
import Swal from "sweetalert2";
import type {
  Testimonial,
  EligibilityResponse,
} from "src/interfaces/Testimonial";

interface MockTestimonial {
  id: number;
  quote: string;
  author: string;
  rol: string;
  rating: number;
  highlighted?: boolean;
}

interface UnifiedTestimonial {
  id: string | number;
  quote: string;
  author: string;
  rol: string;
  rating: number;
  highlighted?: boolean;
}

const mockTestimonials: MockTestimonial[] = [
  {
    id: 1,
    quote:
      "Providence Fitness cambió mi vida! Bajé 14 kilos y gané una fuerza increíble. Nunca me sentí tan bien.",
    author: "Martina López",
    rol: "Miembro desde 2022",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Los entrenadores son unos cracks y la comunidad es re copada. Me siento como en casa.",
    author: "Facundo Rodríguez",
    rol: "Boxeador amateur",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "La mejor inversión que hice en mi vida! Estoy más fuerte y seguro que nunca. Los resultados hablan por sí solos.",
    author: "Valentina García",
    rol: "Miembro VIP",
    rating: 5,
    highlighted: true,
  },
  {
    id: 4,
    quote:
      "De estar en el sillón a correr 10k en 6 meses. Providence me dio las herramientas y la motivación.",
    author: "Lautaro Fernández",
    rol: "Corredor de maratón",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Las clases personalizadas son una locura. Con el seguimiento que hacen, es imposible no progresar.",
    author: "Agustina Silva",
    rol: "Crossfit enthusiast",
    rating: 5,
  },
  {
    id: 6,
    quote:
      "Después de mi lesión, Providence me ayudó a recuperarme. Los profes son unos genios y te cuidan posta.",
    author: "Nicolás Pérez",
    rol: "Futbolista recuperado",
    rating: 5,
  },
];

export default function TestimoniosPage() {
  const { isAuthenticated } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null,
  );
  const [realTestimonials, setRealTestimonials] = useState<Testimonial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    comment: "",
    rating: 5,
  });
  const [formErrors, setFormErrors] = useState({
    comment: "",
    rating: "",
  });

  useEffect(() => {
    loadTestimonials();
  }, [currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      checkEligibility();
    }
  }, [isAuthenticated]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getApprovedTestimonials(
        currentPage,
        6,
      );
      setRealTestimonials(data.testimonials);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const data = await testimonialService.checkEligibility();
      setEligibility(data);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const validateForm = (): boolean => {
    const errors = { comment: "", rating: "" };
    let isValid = true;

    if (formData.comment.trim().length < 10) {
      errors.comment = "El comentario debe tener al menos 10 caracteres";
      isValid = false;
    }

    if (formData.comment.trim().length > 500) {
      errors.comment = "El comentario no puede exceder 500 caracteres";
      isValid = false;
    }

    if (formData.rating < 1 || formData.rating > 5) {
      errors.rating = "La calificación debe estar entre 1 y 5 estrellas";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      await testimonialService.createTestimonial(formData);

      await Swal.fire({
        icon: "success",
        title: "¡Testimonio enviado!",
        text: "Tu testimonio está pendiente de aprobación. ¡Gracias por compartir tu experiencia!",
        confirmButtonColor: "#dc2626",
      });

      setShowForm(false);
      setFormData({ comment: "", rating: 5 });
      await checkEligibility();
      await loadTestimonials();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo enviar el testimonio. Intenta nuevamente.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: "info",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para dejar un testimonio",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Ir a Login",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return;
    }

    if (!eligibility?.canCreateTestimonial) {
      if (eligibility?.hasExistingTestimonial) {
        Swal.fire({
          icon: "info",
          title: "Ya tienes un testimonio",
          text: "Ya has dejado un testimonio anteriormente",
          confirmButtonColor: "#dc2626",
        });
      } else if (eligibility?.completedActivities === 0) {
        Swal.fire({
          icon: "warning",
          title: "Actividad requerida",
          text: "Debes completar al menos una actividad para dejar un testimonio",
          confirmButtonColor: "#dc2626",
        });
      }
      return;
    }

    setShowForm(true);
  };

  const allTestimonials: UnifiedTestimonial[] = [
    ...mockTestimonials,
    ...realTestimonials.map((t) => ({
      id: t.id,
      quote: t.comment,
      profession: t.profession || "",
      author: `${t.user.name} ${t.user.lastname || ""}`.trim(),
      rol: "Miembro verificado",
      rating: t.rating,
    })),
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Sección Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            HISTORIAS DE <span className="text-red-600">ÉXITO</span>
          </h1>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Transformaciones reales de personas de nuestra comunidad. Mirá lo
            que es posible cuando te comprometés con vos mismo.
          </p>
          <p className="text-gray-500 mt-6 text-sm">
            ¿Querés ser parte?{" "}
            <a
              href="/login"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Registrate ahora
            </a>
          </p>

          {/* Botón para dejar testimonio */}
          <button
            onClick={handleOpenForm}
            className="mt-8 px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-md"
          >
            ✍️ Dejá tu Testimonio
          </button>
        </div>
      </section>

      {/* Formulario desplegable */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Dejá tu Testimonio
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        className={`text-3xl transition-colors ${
                          star <= formData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {formErrors.rating && (
                    <p className="text-red-600 text-sm mt-1">
                      {formErrors.rating}
                    </p>
                  )}
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu experiencia *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    placeholder="Contanos cómo fue tu experiencia en Providence..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="flex justify-between items-center mt-1">
                    {formErrors.comment ? (
                      <p className="text-red-600 text-sm">
                        {formErrors.comment}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Mínimo 10 caracteres
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {formData.comment.length}/500
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? "Enviando..." : "Enviar Testimonio"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Testimonios */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading && realTestimonials.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`p-6 rounded-lg transition-all duration-300 hover:shadow-md border-2 hover:border-red-400 ${
                    testimonial.highlighted
                      ? "border-red-500 bg-white"
                      : "border-gray-200 bg-gray-50 hover:bg-white"
                  }`}
                >
                  {/* Estrellas */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  {/* Testimonio */}
                  <p className="text-gray-700 italic mb-6 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  {/* Autor */}
                  <div>
                    <p className="font-bold text-black">{testimonial.author}</p>
                    <p className="text-red-600 text-sm mt-1">
                      {testimonial.rol}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
