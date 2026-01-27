export const activityChannel = new BroadcastChannel("providence-activities");
export const turnChannel = new BroadcastChannel("providence-turns");
export const reservationChannel = new BroadcastChannel(
  "providence-reservations",
);

export const broadcastActivityUpdate = (
  type: "created" | "updated" | "deleted",
  activityId?: string,
) => {
  try {
    activityChannel.postMessage({
      type,
      activityId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.warn("BroadcastChannel no disponible:", error);
  }
};

export const broadcastTurnUpdate = (
  type: "created" | "updated" | "deleted" | "cancelled",
  turnId?: string,
) => {
  try {
    turnChannel.postMessage({
      type,
      turnId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.warn("BroadcastChannel no disponible:", error);
  }
};

export const broadcastReservationUpdate = (
  type: "created" | "cancelled" | "modified",
  reservationId?: string,
) => {
  try {
    reservationChannel.postMessage({
      type,
      reservationId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.warn("BroadcastChannel no disponible:", error);
  }
};
