
// src/interfaces/RegisterDto.ts
export default interface RegisterDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  dni: number;
  genre: string;
  birthdate: string;
  confirmPassword?: string; // Opcional para frontend
}