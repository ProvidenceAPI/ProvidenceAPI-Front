"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "src/contexts/AppContext";
import {
  activityService,
  type Activity,
  type CreateActivityDTO,
  type UpdateActivityDTO,
} from "src/app/lib";
import Swal from "sweetalert2";
import { broadcastActivityUpdate } from "src/utils/broadcastChannel";

interface ScheduleSlot {
  day: string;
  time: string;
}

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

export default function ActivityTab() {
  const { isSuperAdmin, isAdmin } = useAppContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 20,
    duration: 60,
    price: 5000,
    trainer: "",
    hasFreeTrial: false,
  });
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([
    { day: "Lunes", time: "08:00" },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    capacity: "",
    duration: "",
    price: "",
    trainer: "",
    schedule: "",
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const validateField = (field: string, value: any) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value || value.trim().length === 0) {
          error = "El nombre es obligatorio";
        } else if (value.length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        }
        break;

      case "description":
        if (!value || value.trim().length === 0) {
          error = "La descripción es obligatoria";
        } else if (value.length < 50) {
          error = "La descripción debe tener al menos 50 caracteres";
        }
        break;

      case "capacity":
        if (value < 10) {
          error = "El cupo mínimo es 10 personas";
        } else if (value > 25) {
          error = "El cupo máximo es 25 personas";
        }
        break;

      case "duration":
        if (value < 30) {
          error = "La duración mínima es 15 minutos";
        } else if (value > 90) {
          error = "La duración máxima es 90 minutos";
        }
        break;

      case "price":
        if (value < 3000) {
          error = "El precio no puede ser menor a $3000";
        } else if (value > 99999) {
          error = "El precio es demasiado alto";
        }
        break;

      case "trainer":
        if (!value || value.trim().length === 0) {
          error = "El nombre es obligatorio";
        } else if (value.length < 8) {
          error = "El nombre debe tener al menos 8 caracteres";
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data: any = await activityService.getAllActivities();
      if (Array.isArray(data)) {
        setActivities(data);
      } else if (data?.activities && Array.isArray(data.activities)) {
        setActivities(data.activities);
      } else if (data?.data && Array.isArray(data.data)) {
        setActivities(data.data);
      } else {
        setActivities([]);
      }
    } catch (error: any) {
      console.error("Error cargando actividades:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const nameValid = validateField("name", formData.name);
    const descValid = validateField("description", formData.description);
    const capValid = validateField("capacity", formData.capacity);
    const durValid = validateField("duration", formData.duration);
    const priceValid = validateField("price", formData.price);
    const trainerValid = validateField("trainer", formData.trainer);

    if (!nameValid || !descValid || !capValid || !durValid || !priceValid) {
      Swal.fire({
        icon: "error",
        title: "Errores en el formulario",
        text: "Por favor corrige los errores antes de continuar",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    if (scheduleSlots.length === 0) {
      setErrors((prev) => ({
        ...prev,
        schedule: "Debes agregar al menos un horario",
      }));
      Swal.fire("Error", "Debes agregar al menos un horario", "error");
      return;
    }
    if (!formData.name || !formData.description) {
      Swal.fire("Error", "Nombre y descripción son obligatorios", "error");
      return;
    }
    if (scheduleSlots.length === 0) {
      Swal.fire("Error", "Debes agregar al menos un horario", "error");
      return;
    }
    try {
      setIsSubmitting(true);
      const schedule = scheduleSlots.map((slot) => {
        return `${slot.day} ${slot.time}`;
      });
      if (editingActivity) {
        const updateData: UpdateActivityDTO = {
          name: formData.name,
          description: formData.description,
          capacity: formData.capacity,
          duration: formData.duration,
          trainer: formData.trainer,
          price: formData.price,
          schedule: schedule,
          hasFreeTrial: formData.hasFreeTrial,
        };
        await activityService.updateActivity(editingActivity.id, updateData);

        if (imageFile) {
          await activityService.uploadActivityImage(
            editingActivity.id,
            imageFile,
          );
        } else if (imageUrl && imageUrl !== editingActivity.imageUrl) {
          await activityService.updateActivityImageUrl(
            editingActivity.id,
            imageUrl,
          );
        }
        broadcastActivityUpdate("updated", editingActivity.id);
        await fetchActivities();
        closeModal();

        Swal.fire({
          icon: "success",
          title: "✅ Éxito",
          text: "Actividad actualizada correctamente",
          confirmButtonColor: "#10b981",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const createData: CreateActivityDTO = {
          name: formData.name,
          description: formData.description,
          capacity: formData.capacity,
          duration: formData.duration,
          price: formData.price,
          schedule: schedule,
          trainer: formData.trainer,
          hasFreeTrial: formData.hasFreeTrial,
        };
        const createdActivity =
          await activityService.createActivity(createData);
        if (imageFile) {
          try {
            await activityService.uploadActivityImage(
              createdActivity.id,
              imageFile,
            );
          } catch (imgError) {
            console.warn("Error subiendo imagen:", imgError);
          }
        } else if (imageUrl) {
          try {
            await activityService.updateActivityImageUrl(
              createdActivity.id,
              imageUrl,
            );
          } catch (imgError) {
            console.warn("Error actualizando URL de imagen:", imgError);
          }
        }
        broadcastActivityUpdate("created", createdActivity.id);
        await fetchActivities();
        closeModal();

        Swal.fire({
          icon: "success",
          title: "✅ Éxito",
          text: "Actividad creada correctamente",
          confirmButtonColor: "#10b981",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al procesar la solicitud";
      if (
        errorMessage.includes("already exist") ||
        errorMessage.includes("ya existe")
      ) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Actividad duplicada",
          text: "Ya existe una actividad con este nombre. Por favor elige otro nombre.",
          confirmButtonColor: "#f59e0b",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "❌ Error",
          text: errorMessage,
          confirmButtonColor: "#dc2626",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (activity: Activity) => {
    const result = await Swal.fire({
      title: "¿Eliminar actividad?",
      html: `
        <p>¿Estás seguro de eliminar <strong>${activity.name}</strong>?</p>
        <p class="text-sm text-gray-600 mt-2">
          ⚠️ Las reservas futuras serán canceladas automáticamente
          y se notificará a los usuarios afectados.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await activityService.deleteActivity(activity.id);
      broadcastActivityUpdate("deleted", activity.id);
      Swal.fire("✅ Eliminada", "La actividad ha sido eliminada", "success");
      await fetchActivities();
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };
  const handleToggleStatus = async (activity: Activity) => {
    try {
      await activityService.toggleActivityStatus(activity.id);
      broadcastActivityUpdate("updated", activity.id);

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchActivities();
    } catch (error: any) {
      Swal.fire("❌ Error", error.message, "error");
    }
  };

  const convertScheduleToSlots = (schedule: any): ScheduleSlot[] => {
    const slots: ScheduleSlot[] = [];
    if (!schedule || !Array.isArray(schedule)) {
      return [{ day: "Lunes", time: "10:00" }];
    }
    try {
      schedule.forEach((item) => {
        if (typeof item === "string") {
          const parts = item.trim().split(" ");
          if (parts.length >= 2) {
            const day = parts[0]; // Ya viene en español
            const time = parts[1];
            slots.push({ day, time });
          }
        } else if (item?.day && Array.isArray(item.hours)) {
          const day = item.day; // Ya viene en español
          item.hours.forEach((hour: string) => {
            if (hour && typeof hour === "string") {
              slots.push({ day, time: hour });
            }
          });
        }
      });
    } catch (error) {
      return [{ day: "Lunes", time: "10:00" }];
    }
    return slots.length > 0 ? slots : [{ day: "Lunes", time: "10:00" }];
  };
  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      trainer: activity.trainer,
      capacity: activity.capacity,
      duration: activity.duration,
      price:
        typeof activity.price === "number"
          ? activity.price
          : Number(activity.price) || 0,
      hasFreeTrial: activity.hasFreeTrial || false,
    });
    const slots = convertScheduleToSlots(activity.schedule);
    setScheduleSlots(slots);
    setImageUrl(activity.image || activity.imageUrl || "");
    setImageFile(null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormData({
      name: "",
      description: "",
      capacity: 20,
      duration: 60,
      price: 5000,
      trainer: "",
      hasFreeTrial: false,
    });
    setScheduleSlots([{ day: "Lunes", time: "10:00" }]);
    setImageUrl("");
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingActivity(null);
  };
  const addScheduleSlot = () => {
    setScheduleSlots([...scheduleSlots, { day: "Lunes", time: "08:00" }]);
  };
  const removeScheduleSlot = (index: number) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (
    index: number,
    field: "day" | "time",
    value: string,
  ) => {
    const updated = [...scheduleSlots];
    updated[index][field] = value;
    setScheduleSlots(updated);
  };

  const renderSchedule = (schedule: any) => {
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return (
        <span className="text-gray-400 text-xs col-span-full">
          Sin horarios
        </span>
      );
    }
    return schedule.map((daySchedule: any, idx: number) => {
      if (typeof daySchedule === "string") {
        return (
          <div key={idx} className="text-xs text-gray-600">
            {daySchedule}
          </div>
        );
      }
      if (daySchedule?.day && Array.isArray(daySchedule.hours)) {
        return (
          <div key={idx} className="text-xs text-gray-600">
            <span className="font-medium">{daySchedule.day}:</span>{" "}
            {daySchedule.hours.join(", ")}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🏋️ Gestión de Actividades
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {activities.length} actividades
            </p>
          </div>
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={openCreateModal}
              className="px-12 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition"
            >
              ➕ Nueva Actividad
            </button>
          )}
        </div>
      </div>
      {/* Lista de actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 max-w-full mx-auto">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando actividades...</p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl">
            <p className="text-gray-400 text-lg">
              📭 No hay actividades creadas
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition flex flex-col h-full"
            >
              {(activity.image || activity.imageUrl) &&
              !(activity.image || activity.imageUrl).includes("ejemplo") ? (
                <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                  <Image
                    src={activity.image || activity.imageUrl || ""}
                    alt={activity.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-6xl">🏋️</span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {activity.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {activity.status === "Active" ? "✅ Activa" : "⏸️ Inactiva"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {activity.description}
                </p>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">💰 Precio:</span>
                    <span className="font-medium">${activity.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⏱️ Duración:</span>
                    <span className="font-medium">{activity.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">👥 Cupo:</span>
                    <span className="font-medium">{activity.capacity}</span>
                  </div>
                </div>
                <div className="mb-4 pb-4 border-t pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    📅 Horarios:
                  </div>
                  <div className="max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-1">
                      {renderSchedule(activity.schedule)}
                    </div>
                  </div>
                </div>
                {(isAdmin || isSuperAdmin) && (
                  <div className="pt-4 border-t flex gap-2 mt-auto">
                    <button
                      onClick={() => openEditModal(activity)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(activity)}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                    >
                      🔄 Estado
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDelete(activity)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl my-8">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  {editingActivity
                    ? "✏️ Editar Actividad"
                    : "➕ Nueva Actividad"}
                </h2>
                {editingActivity && (
                  <p className="text-gray-600 mt-1">
                    Modificando:{" "}
                    <span className="font-semibold">
                      {editingActivity.name}
                    </span>
                  </p>
                )}
                {!editingActivity && (
                  <p className="text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                    ℹ️ Esto solo creará la actividad. Los turnos se generan
                    desde la pestaña "Gestión de Turnos"
                  </p>
                )}
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      validateField("name", e.target.value);
                    }}
                    onBlur={(e) => validateField("name", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      validateField("description", e.target.value);
                    }}
                    onBlur={(e) => validateField("description", e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cupo *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setFormData({
                          ...formData,
                          capacity: value,
                        });
                        if (e.target.value !== "") {
                          validateField("capacity", value);
                        }
                      }}
                      onBlur={(e) => validateField("trainer", e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                        errors.capacity ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.capacity && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.capacity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (min) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setFormData({
                          ...formData,
                          duration: value,
                        });
                        if (e.target.value !== "") {
                          validateField("duration", value);
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                        errors.duration ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.duration}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        setFormData({
                          ...formData,
                          price: value,
                        });
                        if (e.target.value !== "") {
                          validateField("price", value);
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={formData.trainer}
                      onChange={(e) => {
                        setFormData({ ...formData, trainer: e.target.value });
                        validateField("trainer", e.target.value);
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                        errors.trainer ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.trainer && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.trainer}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clase Gratis
                  </label>
                  <label className="flex items-center cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={formData.hasFreeTrial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasFreeTrial: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Ofrecer primera clase gratis
                    </span>
                  </label>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Horarios *
                    </label>
                    <button
                      type="button"
                      onClick={addScheduleSlot}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                    >
                      ➕ Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {scheduleSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2">
                        <select
                          value={slot.day}
                          onChange={(e) =>
                            updateScheduleSlot(index, "day", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          {DAYS.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <select
                          value={slot.time}
                          onChange={(e) =>
                            updateScheduleSlot(index, "time", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          {TIMES.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        {scheduleSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduleSlot(index)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setImageFile(e.target.files[0]);
                          setImageUrl("");
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="text-center text-sm text-gray-500">O</div>
                    <input
                      type="url"
                      placeholder="URL de imagen"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageFile(null);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition"
                  >
                    {isSubmitting ? (
                      <>🔄 Procesando...</>
                    ) : editingActivity ? (
                      "💾 Guardar Cambios"
                    ) : (
                      "➕ Crear Actividad"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
