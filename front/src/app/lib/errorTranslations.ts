const errorTranslations: Record<string, string> = {
 
  "User not found": "Usuario no encontrado",
  "Your account is banned": "Tu cuenta está baneada",
  "Your account has been cancelled.": "Tu cuenta ha sido cancelada",
  
 
  "Reservation not found": "Reserva no encontrada",
  "Reservation cancelled successfully": "La reserva ya está cancelada",
  "You are not allowed to cancel this reservation": "No tienes permiso para cancelar esta reserva",
  "There is already a reservation for this turn": "Ya existe una reserva para este turno",
  "User already has a reservation for this turn": "El usuario ya tiene una reserva para este turno",
  "Only one reservation per day is allowed.": "Solo se permite una reserva por día",
  
  
  "This turn was cancelled": "Este turno fue cancelado",
  "This turn has already occurred": "Este turno ya ha ocurrido",
  "There are no available spots for this turn": "No hay cupos disponibles para este turno",
  "No available spots for this turn": "No hay cupos disponibles para este turno",
  "Turn cancelled successfully": "El turno ya está cancelado",
  "Turn not found": "Turno no encontrado",
  "Cannot assign a reservation to a cancelled turn": "No se puede asignar una reserva a un turno cancelado",
  "Cannot assign a reservation to a completed turn": "No se puede asignar una reserva a un turno completado",
  "Cannot change the turn of a cancelled reservation": "No se puede cambiar el turno de una reserva cancelada",
  "La reserva ya está asignada a este turno": "La reserva ya está asignada a este turno",
  
  
  "You cannot book turns for inactive activities": "No puedes reservar turnos para actividades inactivas",
  "This activity does not offer free trials. Please subscribe first.": "Esta actividad no ofrece pruebas gratuitas. Por favor, suscríbete primero",
  
  
  "You need an active subscription to book this activity. Please subscribe first.": "Necesitas una suscripción activa para reservar esta actividad. Por favor, suscríbete primero",
  "You have already used your free trial. Subscribe to continue booking classes": "Ya has usado tu prueba gratuita. Suscríbete para continuar reservando clases",
  
 
  "You must book at least 1 hour in advance. This turn starts in": "Debes reservar al menos 1 hora antes. Este turno comienza en",
  "You must reassign at least 1 hour in advance. This turn starts in": "Debes reasignar al menos 1 hora antes. Este turno comienza en",
  "You cannot reassign to a past date": "No puedes reasignar a una fecha pasada",
  "You cannot reassign to a date/time earlier than the original reservation date": "No puedes reasignar a una fecha/hora anterior a la fecha original de la reserva",
  "You can only cancel up to": "Solo puedes cancelar hasta",
  "hours before the turn": "horas antes del turno",
  "minutes.": "minutos.",
  

  "Invalid data": "Datos inválidos",
  "Invalid date or time range": "Rango de fecha u hora inválido",
  "Time slot already reserved": "El horario ya está reservado",
  "Unauthorized": "No autorizado",
  "Forbidden": "Acceso prohibido",
  "Not found": "No encontrado",
  "Bad Request": "Solicitud incorrecta",
  "Conflict": "Conflicto",
  
    "Reserva cancelada existosamente": "Reserva cancelada exitosamente",
};

export function translateErrorMessage(errorMessage: string | undefined | null): string {
  if (!errorMessage) {
    return "Ha ocurrido un error";
  }

  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

 
  const timeAdvanceMatch = errorMessage.match(/You must book at least 1 hour in advance\. This turn starts in (\d+) minutes\./);
  if (timeAdvanceMatch) {
    const minutes = timeAdvanceMatch[1];
    return `Debes reservar al menos 1 hora antes. Este turno comienza en ${minutes} minutos.`;
  }

 
  const cancelTimeMatch = errorMessage.match(/You can only cancel up to (\d+) hours before the turn/);
  if (cancelTimeMatch) {
    const hours = cancelTimeMatch[1];
    return `Solo puedes cancelar hasta ${hours} horas antes del turno`;
  }

  
  for (const [english, spanish] of Object.entries(errorTranslations)) {
    if (errorMessage.includes(english)) {
      
      if (english.includes("minutes") || english.includes("hours")) {
        
        const numbers = errorMessage.match(/\d+/g);
        if (numbers && numbers.length > 0) {
         
          let translated = spanish;
          numbers.forEach((num, index) => {
            if (index === 0) {
              translated = translated.replace(/\d+/, num);
            }
          });
          return translated;
        }
      }
      
      return errorMessage.replace(english, spanish);
    }
  }

 
  return errorMessage;
}


export function getTranslatedErrorMessage(
  error: any,
  defaultMessage: string = "Ha ocurrido un error"
): string {
  if (!error) {
    return defaultMessage;
  }

  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    error.response?.data?.error ||
    error.response?.statusText ||
    null;

  if (errorMessage) {
    return translateErrorMessage(errorMessage);
  }

  return defaultMessage;
}
