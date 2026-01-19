
export interface Payment {
  id: string;
  userId: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  paymentMethod: string;
  mercadoPagoId?: string;
  externalReference?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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