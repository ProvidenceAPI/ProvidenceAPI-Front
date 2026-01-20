'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCalendar } from 'src/contexts/CalendarContext';
import { reservationService } from 'src/app/lib';
import type { User } from 'src/app/lib';
import { Activity } from 'src/interfaces/Activity';

interface ManualReservationFormProps {
  users: User[];
  activities: Activity[];
  onClose: () => void;
  defaultDate?: Date;
}

export default function ManualReservationForm({
  users,
  activities,
  onClose,
  defaultDate,
}: ManualReservationFormProps) {
  const { createManualReservation } = useCalendar();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    availableSlots: number;
    maxParticipants: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    userId: '',
    activityId: '',
    date: defaultDate ? defaultDate.toISOString().split('T')[0] : '',
    startTime: '08:00',
    endTime: '09:00',
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const selectedActivity = activities.find(a => a.id === formData.activityId);

  const checkAvailability = useCallback(async () => {
    if (!formData.activityId || !formData.date || !formData.startTime || !formData.endTime) {
      return;
    }

    try {
      const availability = await reservationService.checkAvailability({
        activityId: formData.activityId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      setAvailability(availability);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  }, [formData.activityId, formData.date, formData.startTime, formData.endTime]);

  useEffect(() => {
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.activityId, formData.date, formData.startTime, formData.endTime, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createManualReservation(formData);
      alert('Reserva creada exitosamente. Se envió un email de confirmación al usuario.');
      onClose();
    } catch (error) {
      alert('Error al crear la reserva');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Crear Reserva Manual</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de usuario con buscador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario *
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
                size={5}
              >
                <option value="">Seleccionar usuario...</option>
                {filteredUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de actividad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actividad *
              </label>
              <select
                value={formData.activityId}
                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Seleccionar actividad...</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} (Max: {activity.capacity ?? '-'} personas)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Hora inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Hora fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Validación de cupos */}
            {availability && (
              <div className={`p-4 rounded-lg ${
                availability.available
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {availability.available ? '✅ Cupos disponibles' : '❌ No hay cupos'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {availability.availableSlots} de {availability.maxParticipants} cupos disponibles
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || (availability && !availability.available)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Creando...' : 'Crear Reserva'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}