export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  rol: "user" | "admin" | "superAdmin";
  status: "Active" | "Inactive" | "Cancelled" | "Banned";
  genre?: "Male" | "Female" | "Other" | string;
  lastname?: string;
  dni?: number;
  birthdate?: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}
