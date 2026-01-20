export interface Payment {
  id: string;
  amount: number;
  status: "approved" | "pending" | "rejected" | "cancelled";
  mercadoPagoId?: string;
  mercadoPagoPreferenceId?: string;
  createdAt: string;

  reservation?: {
    id: string;
  };

  user?: {
    id: string;
    email: string;
  };
}

export interface PaymentPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  amount: number;
  currency: string;
  payment_method: string;
  external_reference: string;
  metadata?: {
    reservationId: string;
    userId: string;
  };
}
