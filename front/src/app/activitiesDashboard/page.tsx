'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppContext } from 'src/contexts/AppContext';
import { activityService, type Activity, type CreateActivityDTO, type UpdateActivityDTO } from 'src/app/lib';
import Swal from 'sweetalert2';

interface ScheduleSlot {
  day: string;
  time: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export default function ActivitiesPage() {
  const { isSuperAdmin, isAdmin } = useAppContext();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 20,
    duration: 60,
    price: 5000,
    instructor: '',
    category: '',
  });
  
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([
    { day: 'Monday', time: '08:00' },
  ]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data: any = await activityService.getAllActivities();
      console.log('📊 Respuesta del backend:', data);
      
      if (Array.isArray(data)) {
        setActivities(data);
      } else if (data?.activities && Array.isArray(data.activities)) {
        setActivities(data.activities);
      } else if (data?.data && Array.isArray(data.data)) {
        setActivities(data.data);
      } else {
        console.error('❌ Estructura no reconocida:', data);
        setActivities([]);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      setActivities([]);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      Swal.fire('Error', 'Nombre y descripción son obligatorios', 'error');
      return;
    }

    if (scheduleSlots.length === 0) {
      Swal.fire('Error', 'Debes agregar al menos un horario', 'error');
      return;
    }

    try {
      const schedule = scheduleSlots.reduce<{ day: string; hours: string[] }[]>((acc, slot) => {
        const existing = acc.find(d => d.day === slot.day);
        if (existing) {
          if (!existing.hours.includes(slot.time)) {
            existing.hours.push(slot.time);
          }
        } else {
          acc.push({ day: slot.day, hours: [slot.time] });
        }
        return acc;
      }, []);

      if (editingActivity) {
        const updateData: UpdateActivityDTO = {
          ...formData,
          schedule,
        };

        await activityService.updateActivity(editingActivity.id, updateData);

        if (imageFile) {
          await activityService.uploadActivityImage(editingActivity.id, imageFile);
        } else if (imageUrl && imageUrl !== editingActivity.imageUrl) {
          await activityService.updateActivityImageUrl(editingActivity.id, imageUrl);
        }

        Swal.fire('✅ Éxito', 'Actividad actualizada correctamente', 'success');
      } else {
        const createData: CreateActivityDTO = {
          ...formData,
          schedule,
        };

        const createdActivity = await activityService.createActivity(createData);

        if (imageFile) {
          await activityService.uploadActivityImage(createdActivity.id, imageFile);
        } else if (imageUrl) {
          await activityService.updateActivityImageUrl(createdActivity.id, imageUrl);
        }

        Swal.fire('✅ Éxito', 'Actividad creada correctamente', 'success');
      }

      await fetchActivities();
      closeModal();
    } catch (error: any) {
      Swal.fire('❌ Error', error.message, 'error');
    }
  };

  const handleDelete = async (activity: Activity) => {
    const result = await Swal.fire({
      title: '¿Eliminar actividad?',
      html: `
        <p>¿Estás seguro de eliminar <strong>${activity.name}</strong>?</p>
        <p class="text-sm text-gray-600 mt-2">
          ⚠️ Las reservas futuras serán canceladas automáticamente
          y se notificará a los usuarios afectados.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await activityService.deleteActivity(activity.id);
      Swal.fire('✅ Eliminada', 'La actividad ha sido eliminada', 'success');
      await fetchActivities();
    } catch (error: any) {
      Swal.fire('❌ Error', error.message, 'error');
    }
  };

  const handleToggleStatus = async (activity: Activity) => {
    try {
      await activityService.toggleActivityStatus(activity.id);
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchActivities();
    } catch (error: any) {
      Swal.fire('❌ Error', error.message, 'error');
    }
  };

  // 🔥 FIX: Función para convertir schedule de manera segura
  const convertScheduleToSlots = (schedule: any): ScheduleSlot[] => {
    const slots: ScheduleSlot[] = [];
    
    // Validar que schedule existe y es un array
    if (!schedule || !Array.isArray(schedule)) {
      console.warn('⚠️ Schedule inválido:', schedule);
      return [{ day: 'Monday', time: '08:00' }];
    }

    try {
      schedule.forEach(day => {
        // Validar que day existe y tiene la estructura correcta
        if (!day || !day.day || !Array.isArray(day.hours)) {
          console.warn('⚠️ Day inválido:', day);
          return;
        }

        day.hours.forEach(hour => {
          if (hour && typeof hour === 'string') {
            slots.push({ day: day.day, time: hour });
          }
        });
      });
    } catch (error) {
      console.error('❌ Error convirtiendo schedule:', error);
      return [{ day: 'Monday', time: '08:00' }];
    }

    // Si no hay slots válidos, retornar uno por defecto
    return slots.length > 0 ? slots : [{ day: 'Monday', time: '08:00' }];
  };

  const openEditModal = (activity: Activity) => {
    console.log('🔍 Editando actividad:', activity);
    
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      capacity: activity.capacity,
      duration: activity.duration,
      price: typeof activity.price === 'number' ? activity.price : Number(activity.price) || 0,
      instructor: activity.instructor || '',
      category: activity.category || '',
    });
    
    // 🔥 Usar la función segura para convertir schedule
    const slots = convertScheduleToSlots(activity.schedule);
    console.log('📅 Slots convertidos:', slots);
    setScheduleSlots(slots);
    
    setImageUrl(activity.imageUrl || '');
    setImageFile(null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingActivity(null);
    setFormData({
      name: '',
      description: '',
      capacity: 20,
      duration: 60,
      price: 5000,
      instructor: '',
      category: '',
    });
    setScheduleSlots([{ day: 'Monday', time: '08:00' }]);
    setImageUrl('');
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingActivity(null);
  };

  const addScheduleSlot = () => {
    setScheduleSlots([...scheduleSlots, { day: 'Monday', time: '08:00' }]);
  };

  const removeScheduleSlot = (index: number) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index: number, field: 'day' | 'time', value: string) => {
    const updated = [...scheduleSlots];
    updated[index][field] = value;
    setScheduleSlots(updated);
  };

  // 🔥 FIX: Función segura para renderizar horarios
  const renderSchedule = (schedule: any) => {
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return <span className="text-gray-400 text-xs">Sin horarios</span>;
    }

    return (
      <div className="space-y-1">
        {schedule.slice(0, 2).map((day, idx) => {
          if (!day || !day.day || !Array.isArray(day.hours)) return null;
          
          return (
            <div key={idx} className="text-xs text-gray-600">
              <span className="font-medium">{day.day}:</span> {day.hours.join(', ')}
            </div>
          );
        })}
        {schedule.length > 2 && (
          <div className="text-xs text-gray-400">+{schedule.length - 2} más</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏋️ Gestión de Actividades</h1>
            <p className="text-gray-600 mt-1">Total: {activities.length} actividades</p>
          </div>
          
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition"
            >
              ➕ Nueva Actividad
            </button>
          )}
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando actividades...</p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl">
            <p className="text-gray-400 text-lg">📭 No hay actividades creadas</p>
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
              {activity.imageUrl && (
                <Image
                  src={activity.imageUrl}
                  alt={activity.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{activity.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status === 'active' ? '✅ Activa' : '⏸️ Inactiva'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>
                
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

                {/* Horarios */}
                <div className="mb-4 pb-4 border-t pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">📅 Horarios:</div>
                  {renderSchedule(activity.schedule)}
                </div>
                
                {(isAdmin || isSuperAdmin) && (
                  <div className="pt-4 border-t flex gap-2">
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-3xl my-8">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingActivity ? '✏️ Editar Actividad' : '➕ Nueva Actividad'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cupo *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
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
                        onChange={e => updateScheduleSlot(index, 'day', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        {DAYS.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>

                      <select
                        value={slot.time}
                        onChange={e => updateScheduleSlot(index, 'time', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        {TIMES.map(time => (
                          <option key={time} value={time}>{time}</option>
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
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        setImageFile(e.target.files[0]);
                        setImageUrl('');
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  <div className="text-center text-sm text-gray-500">O</div>
                  
                  <input
                    type="url"
                    placeholder="URL de imagen"
                    value={imageUrl}
                    onChange={e => {
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition"
                >
                  {editingActivity ? '💾 Guardar Cambios' : '➕ Crear Actividad'}
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
      )}
    </div>
  );
}