export default interface RegisterFormState {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string; // Cambiar de repeatPassword a confirmPassword
  phone: string;
  dni: number;
  genre: string;
  birthdate: string;      // Formato: "1991-03-12"
}
