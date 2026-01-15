export default interface RegisterDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;  // ¡AGREGAR ESTO!
  birthdate: string;        // Formato: "1991-03-12" (YYYY-MM-DD)
  phone: string;           // Como string, no number
  dni: number;
  genre: string;           // "Female" o "Male" según Swagger
}
