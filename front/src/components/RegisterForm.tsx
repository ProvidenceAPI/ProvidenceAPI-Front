"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RegisterDto from "src/interfaces/RegisterDto";
import RegisterFormState from "src/interfaces/RegisterFormState";

interface FormErrors {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dni: string;
  genre: string;
  birthdate: string;
}

interface ValidationRules {
  name: boolean;
  lastname: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  phone: boolean;
  dni: boolean;
  genre: boolean;
  birthdate: boolean;
}

const formInicialState: RegisterFormState = {
  name: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  dni: 0,
  genre: "",
  birthdate: "",
};

const initialErrors: FormErrors = {
  name: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  dni: "",
  genre: "",
  birthdate: "",
};

const initialValidations: ValidationRules = {
  name: false,
  lastname: false,
  email: false,
  password: false,
  confirmPassword: false,
  phone: false,
  dni: false,
  genre: false,
  birthdate: false,
};

export default function RegisterForm() {
  const router = useRouter();
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(formInicialState);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [validations, setValidations] = useState<ValidationRules>(initialValidations);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    // Limpiar timeout anterior
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateRealTime();
    }, 100); // 100ms de delay
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [registerForm]);

  const validateRealTime = useCallback(() => {
    const newValidations = { ...initialValidations };

    newValidations.name = registerForm.name.length >= 3 && registerForm.name.length <= 80;

    newValidations.lastname = registerForm.lastname.length >= 3 && registerForm.lastname.length <= 80;

    if (registerForm.email) {
      const emailRegex = /\S+@\S+\.\S+/;
      newValidations.email = emailRegex.test(registerForm.email);
    }

    if (registerForm.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
      newValidations.password = registerForm.password.length >= 8 && 
        registerForm.password.length <= 15 && 
        passwordRegex.test(registerForm.password);
    }

    if (registerForm.confirmPassword) {
      newValidations.confirmPassword = registerForm.password === registerForm.confirmPassword && 
        registerForm.confirmPassword.length > 0;
    }

    if (registerForm.phone) {
      const phoneRegex = /^\d{10,15}$/;
      newValidations.phone = phoneRegex.test(registerForm.phone.replace(/\D/g, ''));
    }

    if (registerForm.dni) {
      const dniString = registerForm.dni.toString();
      newValidations.dni = registerForm.dni > 0 && 
        /^\d{7,10}$/.test(dniString) && 
        registerForm.dni >= 1000000 && 
        registerForm.dni <= 9999999999;
    }

    newValidations.genre = registerForm.genre !== "";

    if (registerForm.birthdate) {
      const birthDate = new Date(registerForm.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      newValidations.birthdate = age >= 16;
    }
    
    setValidations(newValidations);
  }, [registerForm]);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const property = e.target.name;
    let value = e.target.value;

    if (property === "dni") {
      const numericValue = value.replace(/\D/g, '');
      value = numericValue;
    }
    else if (property === "phone") {
      value = value.replace(/\D/g, '');
    }

    setRegisterForm(prev => ({
      ...prev,
      [property]: property === "dni" ? (value ? parseInt(value, 10) : 0) : value,
    }));

    if (errors[property as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [property]: "",
      }));
    }
  };

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setRegisterForm(prev => ({ ...prev, email: value }));

    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }

    setEmailExists(false);

    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }
    
    emailCheckTimeoutRef.current = setTimeout(() => {
      if (value.includes("@") && value.length > 3) {
        checkEmailAvailability(value);
      } else {
        setEmailChecking(false);
      }
    }, 500);
  }, [errors.email]);

  const checkEmailAvailability = async (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setEmailChecking(false);
      setEmailExists(false);
      return;
    }
    
    setEmailChecking(true);
    try {
      // Aquí deberías hacer la llamada real a tu backend
      // Ejemplo: const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-email/${email}`);
      // setEmailExists(response.data.exists);
      
      // Simulación - en producción, quitar esto y usar la llamada real
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setEmailChecking(false);
      setEmailExists(false);
      
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailChecking(false);
      setEmailExists(false);
    }
  };

  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors = { ...initialErrors };
    let isValid = true;

    if (!registerForm.name.trim()) {
      newErrors.name = "Falta el nombre";
      isValid = false;
    } else if (registerForm.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    } else if (registerForm.name.length > 80) {
      newErrors.name = "El nombre no debe exceder 80 caracteres";
      isValid = false;
    }

    if (!registerForm.lastname.trim()) {
      newErrors.lastname = "Falta el apellido";
      isValid = false;
    } else if (registerForm.lastname.length < 3) {
      newErrors.lastname = "El apellido debe tener al menos 3 caracteres";
      isValid = false;
    } else if (registerForm.lastname.length > 80) {
      newErrors.lastname = "El apellido no debe exceder 80 caracteres";
      isValid = false;
    }

    if (!registerForm.email) {
      newErrors.email = "Falta el correo electrónico";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "El correo electrónico no es válido";
      isValid = false;
    } else if (emailExists) {
      newErrors.email = "Este correo ya está registrado";
      isValid = false;
    }

    if (!registerForm.password) {
      newErrors.password = "Falta la contraseña";
      isValid = false;
    } else if (registerForm.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      isValid = false;
    } else if (registerForm.password.length > 15) {
      newErrors.password = "La contraseña no debe exceder 15 caracteres";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(registerForm.password)) {
      newErrors.password = "Debe contener mayúsculas, minúsculas, números y caracteres especiales (!@#$%^&*)";
      isValid = false;
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
      isValid = false;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    if (!registerForm.phone.trim()) {
      newErrors.phone = "Falta el teléfono";
      isValid = false;
    } else if (!/^\d{10,15}$/.test(registerForm.phone)) {
      newErrors.phone = "El teléfono debe tener entre 10 y 15 dígitos";
      isValid = false;
    }

    if (!registerForm.dni || registerForm.dni === 0) {
      newErrors.dni = "Falta el DNI";
      isValid = false;
    } else {
      const dniString = registerForm.dni.toString();
      if (!/^\d{7,10}$/.test(dniString)) {
        newErrors.dni = "El DNI debe tener entre 7 y 10 dígitos";
        isValid = false;
      } else if (registerForm.dni < 1000000) {
        newErrors.dni = "El DNI debe ser mayor a 1,000,000";
        isValid = false;
      } else if (registerForm.dni > 9999999999) {
        newErrors.dni = "El DNI debe ser menor a 9,999,999,999";
        isValid = false;
      }
    }

    if (!registerForm.genre) {
      newErrors.genre = "Selecciona tu género";
      isValid = false;
    }

    if (!registerForm.birthdate) {
      newErrors.birthdate = "Falta la fecha de nacimiento";
      isValid = false;
    } else {
      const birthDate = new Date(registerForm.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        newErrors.birthdate = "Debes tener al menos 16 años";
        isValid = false;
      }
    }

    if (!acceptTerms) {
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const postRegister = async (registerDto: RegisterDto) => {
    return await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
      registerDto
    );
  };

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/login`;
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = googleAuthUrl;
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      if (!acceptTerms) {
        await Swal.fire({
          title: "Acepta los términos",
          text: "Debes aceptar los términos y condiciones para continuar",
          icon: "warning",
          confirmButtonText: "Entendido",
        });
      }
      return;
    }
    
    setIsLoading(true);
    try {
      const registerDto: RegisterDto = {
        name: registerForm.name,
        lastname: registerForm.lastname,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        dni: registerForm.dni,
        confirmPassword: registerForm.confirmPassword,
        genre: registerForm.genre,
        birthdate: registerForm.birthdate,
      };
      
      await postRegister(registerDto);
      setRegisterForm(formInicialState);
      setAcceptTerms(false);
      
      await Swal.fire({
        title: "¡Usuario creado con éxito!",
        text: "Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada.",
        icon: "success",
        confirmButtonText: "Ir al Login",
      });
      
      router.push("/login");
    } catch (error: any) {
      let errorMessage = "Error al crear el usuario";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (errorMessage.includes("email") || errorMessage.includes("correo")) {
          setErrors(prev => ({
            ...prev,
            email: "Este correo ya está registrado",
          }));
          setEmailExists(true);
        }
      }
      
      await Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Reintentar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { text: "Sin contraseña", color: "text-gray-400" };
    if (password.length < 8) return { text: "Muy débil", color: "text-red-500" };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score === 1) return { text: "Débil", color: "text-red-500" };
    if (score === 2) return { text: "Regular", color: "text-yellow-500" };
    if (score === 3) return { text: "Buena", color: "text-green-500" };
    if (score === 4) return { text: "Excelente", color: "text-green-600" };
    return { text: "Sin contraseña", color: "text-gray-400" };
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Black section */}
      <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-center px-12 py-20">
        <div className="text-2xl font-bold tracking-[0.2em]">
          <Link href="/" className="flex flex-col hover:no-underline">
            <img src="/logo_1.png" alt="Providence Fitness Logo" className="h-8 w-auto" />
          </Link>
        </div>
        <h2 className="text-5xl font-bold leading-tight mb-6">
          COMIENZA TU <br /> TRANSFORMACIÓN HOY
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Únete a miles de miembros que ya han alcanzado sus metas fitness.
        </p>
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <div className="bg-[#DC2626] p-2 rounded-full mt-1">
              <span className="text-white">💪</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Rutina Personalizada</h3>
              <p className="text-gray-400">Programa de entrenamiento adaptado a tus objetivos</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-[#DC2626] p-2 rounded-full mt-1">
              <span className="text-white">👥</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Comunidad Activa</h3>
              <p className="text-gray-400">Conecta con personas que comparten tus mismos objetivos</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-[#DC2626] p-2 rounded-full mt-1">
              <span className="text-white">⏰</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Horario Flexible</h3>
              <p className="text-gray-400">Entrena cuando quieras, sin restricciones de horario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-12 py-20 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">CREAR CUENTA</h2>
            <p className="text-gray-600">Completa todos los campos para unirte a Providence Fitness.</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6" noValidate>
            {/* Nombre y Apellido en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.name ? "text-red-600" : "text-black"}`}>
                  NOMBRE (3-80 caracteres)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.name ? "text-red-500" : validations.name ? "text-green-500" : "text-gray-400"}`}>
                    {validations.name ? "✓" : "👤"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.name ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : validations.name ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={changeHandler}
                    placeholder="Nombre"
                    disabled={isLoading}
                  />
                </div>
                {errors.name ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                ) : registerForm.name.length > 0 && !validations.name && (
                  <p className="mt-2 text-sm text-yellow-600">Debe tener entre 3 y 80 caracteres</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.lastname ? "text-red-600" : "text-black"}`}>
                  APELLIDO (3-80 caracteres)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.lastname ? "text-red-500" : validations.lastname ? "text-green-500" : "text-gray-400"}`}>
                    {validations.lastname ? "✓" : "👤"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.lastname ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : validations.lastname ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type="text"
                    name="lastname"
                    value={registerForm.lastname}
                    onChange={changeHandler}
                    placeholder="Apellido"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastname ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.lastname}
                  </p>
                ) : registerForm.lastname.length > 0 && !validations.lastname && (
                  <p className="mt-2 text-sm text-yellow-600">Debe tener entre 3 y 80 caracteres</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${errors.email ? "text-red-600" : "text-black"}`}>
                CORREO ELECTRÓNICO
                {emailChecking && (
                  <span className="ml-2 text-xs text-blue-500">(verificando...)</span>
                )}
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.email ? "text-red-500" : validations.email ? "text-green-500" : "text-gray-400"}`}>
                  {validations.email ? "✓" : "✉️"}
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.email ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : emailExists ? "border-yellow-500 bg-yellow-50" : validations.email ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleEmailChange}
                  placeholder="ejemplo@correo.com"
                  disabled={isLoading || emailChecking}
                />
                {emailExists && !errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-yellow-600 text-sm">⚠️ Email registrado</span>
                  </div>
                )}
              </div>
              {errors.email ? (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              ) : registerForm.email.length > 0 && !validations.email && (
                <p className="mt-2 text-sm text-yellow-600">Introduce un email válido (ejemplo@correo.com)</p>
              )}
            </div>

            {/* DNI y Teléfono en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DNI */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.dni ? "text-red-600" : "text-black"}`}>
                  DNI (7-10 dígitos)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.dni ? "text-red-500" : validations.dni ? "text-green-500" : "text-gray-400"}`}>
                    {validations.dni ? "✓" : "🆔"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.dni ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : validations.dni ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type="text"
                    name="dni"
                    value={registerForm.dni || ""}
                    onChange={changeHandler}
                    placeholder="123456789"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    disabled={isLoading}
                  />
                </div>
                {errors.dni ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.dni}
                  </p>
                ) : registerForm.dni > 0 && !validations.dni && (
                  <p className="mt-2 text-sm text-yellow-600">Debe tener entre 7 y 10 dígitos</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.phone ? "text-red-600" : "text-black"}`}>
                  TELÉFONO (10-15 dígitos)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.phone ? "text-red-500" : validations.phone ? "text-green-500" : "text-gray-400"}`}>
                    {validations.phone ? "✓" : "📱"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.phone ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : validations.phone ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type="text"
                    name="phone"
                    value={registerForm.phone}
                    onChange={changeHandler}
                    placeholder="3157615003"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                ) : registerForm.phone.length > 0 && !validations.phone && (
                  <p className="mt-2 text-sm text-yellow-600">Debe tener entre 10 y 15 dígitos</p>
                )}
              </div>
            </div>

            {/* Género y Fecha de Nacimiento en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Género */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.genre ? "text-red-600" : "text-black"}`}>
                  GÉNERO
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.genre ? "text-red-500" : validations.genre ? "text-green-500" : "text-gray-400"}`}>
                    {validations.genre ? "✓" : "⚤"}
                  </span>
                  <select
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition appearance-none ${errors.genre ? "border-red-500 bg-red-50 text-red-900" : validations.genre ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    name="genre"
                    value={registerForm.genre}
                    onChange={changeHandler}
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar género</option>
                    <option value="Male">Masculino</option>
                    <option value="Female">Femenino</option>
                    <option value="Other">Otro</option>
                    <option value="Nonbinary">No binario</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.genre && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.genre}
                  </p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.birthdate ? "text-red-600" : "text-black"}`}>
                  FECHA DE NACIMIENTO (Mínimo 16 años)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.birthdate ? "text-red-500" : validations.birthdate ? "text-green-500" : "text-gray-400"}`}>
                    {validations.birthdate ? "✓" : "🎂"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.birthdate ? "border-red-500 bg-red-50 text-red-900" : validations.birthdate ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type="date"
                    name="birthdate"
                    value={registerForm.birthdate}
                    onChange={changeHandler}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                  />
                </div>
                {errors.birthdate ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.birthdate}
                  </p>
                ) : registerForm.birthdate && !validations.birthdate && (
                  <p className="mt-2 text-sm text-yellow-600">Debes tener al menos 16 años</p>
                )}
              </div>
            </div>

            {/* Contraseña y Confirmar Contraseña en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contraseña */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.password ? "text-red-600" : "text-black"}`}>
                  CONTRASEÑA (8-15 caracteres)
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.password ? "text-red-500" : validations.password ? "text-green-500" : "text-gray-400"}`}>
                    {validations.password ? "✓" : "🔒"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.password ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : validations.password ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={registerForm.password}
                    onChange={changeHandler}
                    placeholder="Contraseña123*"
                    minLength={8}
                    maxLength={15}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {registerForm.password.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${getPasswordStrength(registerForm.password).color}`}>
                            Seguridad: {getPasswordStrength(registerForm.password).text}
                          </span>
                          <span className={`text-sm ${registerForm.password.length < 8 ? 'text-red-500' : registerForm.password.length > 15 ? 'text-red-500' : 'text-green-600'}`}>
                            {registerForm.password.length}/15
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={`flex items-center ${/[a-z]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="mr-1">{/[a-z]/.test(registerForm.password) ? '✓' : '○'}</span> Minúscula
                          </div>
                          <div className={`flex items-center ${/[A-Z]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="mr-1">{/[A-Z]/.test(registerForm.password) ? '✓' : '○'}</span> Mayúscula
                          </div>
                          <div className={`flex items-center ${/\d/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="mr-1">{/\d/.test(registerForm.password) ? '✓' : '○'}</span> Número
                          </div>
                          <div className={`flex items-center ${/[!@#$%^&*]/.test(registerForm.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="mr-1">{/[!@#$%^&*]/.test(registerForm.password) ? '✓' : '○'}</span> Especial
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${errors.confirmPassword ? "text-red-600" : "text-black"}`}>
                  CONFIRMAR CONTRASEÑA
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${errors.confirmPassword ? "text-red-500" : validations.confirmPassword ? "text-green-500" : "text-gray-400"}`}>
                    {validations.confirmPassword ? "✓" : "🔒"}
                  </span>
                  <input
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition ${errors.confirmPassword ? "border-red-500 bg-red-50 text-red-900 placeholder-red-300" : validations.confirmPassword ? "border-green-500 bg-green-50 text-gray-900 focus:bg-white" : "border-gray-300 bg-gray-50 text-gray-900 focus:bg-white"}`}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={changeHandler}
                    placeholder="Repite tu contraseña"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                ) : registerForm.confirmPassword.length > 0 && !validations.confirmPassword && (
                  <p className="mt-2 text-sm text-yellow-600">Las contraseñas no coinciden</p>
                )}
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className={`mt-1 w-4 h-4 rounded border-2 cursor-pointer transition ${acceptTerms ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Acepto los términos y condiciones y la política de privacidad
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white text-lg transition-all uppercase tracking-wider ${isLoading || !acceptTerms ? "bg-gray-400 cursor-not-allowed" : "bg-[#DC2626] hover:bg-[#B01C1C]"}`}
              disabled={isLoading || !acceptTerms}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                <>
                  CREAR CUENTA
                  <span className="ml-2">→</span>
                </>
              )}
            </button>

            {/* Social Login */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O regístrate con</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={googleLoading || isLoading}
              >
                {googleLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Conectando con Google...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-medium">Continuar con Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-700">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-[#DC2626] font-bold hover:underline">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}