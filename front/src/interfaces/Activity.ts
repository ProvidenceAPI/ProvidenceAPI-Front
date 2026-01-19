export interface Activity {
  id: string; 
  name: string;  
  description: string;
  duration: number;
  cancellationTime: number;
  reservationDays: number;
  capacity: number;
  hasFreeTrial: boolean;
  price: string;  
  schedule: string[]; 
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}