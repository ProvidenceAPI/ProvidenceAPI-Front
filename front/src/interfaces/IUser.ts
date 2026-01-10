export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string; // URL de Cloudinary
  rol: "user" | "admin";
  status: "Active" | "Inactive";
  genre?: "Male" | "Female" | "Other";
  lastname?: string;
  dni?: number;
  birthdate?: string;
  updatedAt?: string | Date; // Añade esto
}
