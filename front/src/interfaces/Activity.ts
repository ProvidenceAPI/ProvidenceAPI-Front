export interface Activity {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  cancellationTime?: number;
  reservationDays?: number;
  capacity?: number;
  hasFreeTrial?: boolean;
  price?: string | number;
  schedule?: string[];
  image?: string;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  trainer?: string;
}
