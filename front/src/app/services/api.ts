// stubs de API del lado del cliente para interactuar con tu backend

export async function login(email: string, password: string) {
// reemplaza estos stubs con llamadas reales de red
  if (email === "admin@prov.com" && password === "admin") {
    return {
      ok: true,
      token: "fake-admin-token",
      user: { id: "1", name: "Admin", email, role: "admin" },
    };
  }
  if (email === "user@prov.com" && password === "user") {
    return {
      ok: true,
      token: "fake-user-token",
      user: { id: "2", name: "User", email, role: "user" },
    };
  }
  return { ok: false, message: "Credenciales inválidas" };
}

export async function register(payload: { name: string; email: string; password: string; phone?: string }) {
// simula la creación de un usuario
  return {
    ok: true,
    token: "fake-token",
    user: { id: Date.now().toString(), name: payload.name, email: payload.email, phone: payload.phone, role: "user" },
  };
}
// Actividades
export type Activity = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "yoga" | "fitness" | "dance" | "pilates" | string;
  image?: string;
  schedules: Array<{ id: string; datetime: string; capacity: number; available: number }>;
};

let activities: Activity[] = [
  {
    id: "a1",
    name: "Yoga Básico",
    description: "Clase de yoga para principiantes",
    price: 10,
    type: "yoga",
    schedules: [
      { id: "s1", datetime: new Date().toISOString(), capacity: 10, available: 5 },
      { id: "s2", datetime: new Date(Date.now() + 86400000).toISOString(), capacity: 10, available: 10 },
    ],
  },
  {
    id: "a2",
    name: "HIIT",
    description: "Entrenamiento de alta intensidad",
    price: 12,
    type: "fitness",
    schedules: [
      { id: "s3", datetime: new Date().toISOString(), capacity: 15, available: 0 },
    ],
  },
];

export async function getActivities() {
  return activities;
}

export async function getActivity(id: string) {
  return activities.find((a) => a.id === id) || null;
}

export async function createActivity(payload: Partial<Activity>) {
  const newAct: Activity = {
    id: Date.now().toString(),
    name: payload.name || "Nueva Actividad",
    description: payload.description || "",
    price: payload.price || 0,
    type: (payload.type as any) || "fitness",
    image: payload.image,
    schedules: payload.schedules || [],
  };
  activities.push(newAct);
  return newAct;
}

export async function updateActivity(id: string, payload: Partial<Activity>) {
  const idx = activities.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Not found");
  activities[idx] = { ...activities[idx], ...payload };
  return activities[idx];
}

export async function deleteActivity(id: string) {
  activities = activities.filter((a) => a.id !== id);
  return true;
}

// Reservas
export type Reservation = {
  id: string;
  userId: string;
  activityId: string;
  scheduleId: string;
  datetime: string;
  status: "active" | "cancelled" | "completed";
};

let reservations: Reservation[] = [];

export async function getUserReservations(userId: string) {
  return reservations.filter((r) => r.userId === userId);
}

export async function createReservation(payload: { userId: string; activityId: string; scheduleId: string }) {
  const act = activities.find((a) => a.id === payload.activityId);
  if (!act) return { ok: false, message: "Actividad no encontrada" };
  const sched = act.schedules.find((s) => s.id === payload.scheduleId);
  if (!sched) return { ok: false, message: "Horario no encontrado" };
  if (sched.available <= 0) return { ok: false, message: "No hay cupos disponibles" };
  sched.available -= 1;
  const r: Reservation = { id: Date.now().toString(), userId: payload.userId, activityId: act.id, scheduleId: sched.id, datetime: sched.datetime, status: "active" };
  reservations.push(r);
  return { ok: true, reservation: r };
}

export async function cancelReservation(id: string) {
  const idx = reservations.findIndex((r) => r.id === id);
  if (idx === -1) return { ok: false };
  reservations[idx].status = "cancelled";
  const act = activities.find((a) => a.id === reservations[idx].activityId);
  if (act) {
    const sched = act.schedules.find((s) => s.id === reservations[idx].scheduleId);
    if (sched) sched.available += 1;
  }
  return { ok: true };
}

// Pagos
export type Payment = {
  id: string;
  userId: string;
  reservationId?: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
};

let payments: Payment[] = [];

export async function createPayment(payload: { userId: string; reservationId?: string; amount: number }) {
  const p: Payment = { id: Date.now().toString(), userId: payload.userId, reservationId: payload.reservationId, amount: payload.amount, date: new Date().toISOString(), status: "paid" };
  payments.push(p);
  return { ok: true, payment: p };
}

export async function getUserPayments(userId: string) {
  return payments.filter((p) => p.userId === userId);
}

// Usuarios (admin)
export async function getUsers() {
  return [
    { id: "1", name: "Admin", email: "admin@prov.com", role: "admin" },
    { id: "2", name: "User", email: "user@prov.com", role: "user" },
  ];
}
