"use client";

import RegisterDto from "@/interfaces/RegisterDto";
import RegisterFormState from "@/interfaces/RegisterFormState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";


const formInicialState = {
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    address: "",
    phone: "",
};

export default function RegisterForm() {
    const router = useRouter();
    const [registerForm, setRegisterForm] = useState<RegisterFormState>(formInicialState);
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        repeatPassword: "",
        address: "",
        phone: "",
    });

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const property = e.target.name;
        const value = e.target.value;

        setRegisterForm({
            ...registerForm,
            [property]: value,
        });

        // Limpiar error cuando el usuario empiece a escribir
        if (errors[property as keyof typeof errors]) {
            setErrors({
                ...errors,
                [property]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: "",
            email: "",
            password: "",
            repeatPassword: "",
            address: "",
            phone: "",
        };
        let isValid = true;

        if (!registerForm.name.trim()) {
            newErrors.name = "Falta el nombre completo";
            isValid = false;
        } else if (registerForm.name.length > 20) {
            newErrors.password = "El nombre debe tener menos de 20 caracteres";
            isValid = false;
        }

        if (!registerForm.email) {
            newErrors.email = "Falta el correo electrónico";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
            newErrors.email = "Formato de email inválido. Ejemplo: usuario@email.com";
            isValid = false;
        }

        if (!registerForm.password) {
            newErrors.password = "Falta la contraseña";
            isValid = false;
        } else if (registerForm.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
            isValid = false;
        }

        if (!registerForm.repeatPassword) {
            newErrors.repeatPassword = "Confirma tu contraseña";
            isValid = false;
        } else if (registerForm.password !== registerForm.repeatPassword) {
            newErrors.repeatPassword = "Las contraseñas no coinciden";
            isValid = false;
        }

        if (!registerForm.address.trim()) {
            newErrors.address = "Falta la dirección";
            isValid = false;
        }

        if (!registerForm.phone.trim()) {
            newErrors.phone = "Falta el teléfono";
            isValid = false;
        } else if (!/^[0-9\-\+\(\)\s]+$/.test(registerForm.phone)) {
            newErrors.phone = "Formato de teléfono no válido";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const postRegister = async (registerDto: RegisterDto) => {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, 
            registerDto
        );
    };

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validar el formulario antes de enviar
        if (!validateForm()) {
            return;
        }

        try {
            await postRegister(registerForm);
            setRegisterForm(formInicialState);
            
            await Swal.fire({
                title: '¡Usuario creado con éxito!',
                text: 'Tu cuenta ha sido creada correctamente',
                icon: 'success',
                confirmButtonText: 'Ir al Login'
            });
            
            router.push("/login");
        } catch(error) {
            await Swal.fire({
                title: 'Error',
                text: 'Error al crear el usuario',
                icon: 'error',
                confirmButtonText: 'Reintentar'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Registrarse
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Crea tu cuenta para empezar a comprar
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-4" noValidate>
                   
                    <div>
                        <label className="block text-sm mb-1">
                            Nombre Completo
                        </label>
                        <input
                            className={`w-full p-3 border rounded-md ${errors.name ? "border-red-500" : "border-gray-300"}`}
                            type="text"
                            value={registerForm.name}
                            name="name"
                            onChange={changeHandler}
                            placeholder="Ingresa tu nombre"
                        />
                        {errors.name && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            className={`w-full p-3 border rounded-md ${errors.email ? "border-red-500" : "border-gray-300"}`}
                            type="email"
                            value={registerForm.email}
                            name="email"
                            onChange={changeHandler}
                            placeholder="ejemplo@correo.com"
                        />
                        {errors.email && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Contraseña
                        </label>
                        <input
                            className={`w-full p-3 border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"}`}
                            type="password"
                            value={registerForm.password}
                            name="password"
                            onChange={changeHandler}
                            placeholder="********"
                        />
                        {errors.password && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.password}</span>
                        )}
                    </div>
                
                    <div>
                        <label className="block text-sm mb-1">
                            Repetir Contraseña
                        </label>
                        <input
                            className={`w-full p-3 border rounded-md ${errors.repeatPassword ? "border-red-500" : "border-gray-300"}`}
                            type="password"
                            value={registerForm.repeatPassword}
                            name="repeatPassword"
                            onChange={changeHandler}
                            placeholder="********"
                        />
                        {errors.repeatPassword && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.repeatPassword}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Dirección
                        </label>
                        <input
                            className={`w-full p-3 border rounded-md ${errors.address ? "border-red-500" : "border-gray-300"}`}
                            type="text"
                            value={registerForm.address}
                            name="address"
                            onChange={changeHandler}
                            placeholder="Ingresa tu direccion"
                        />
                        {errors.address && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.address}</span>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">
                            Teléfono
                        </label>
                        <input
                            className={`w-full p-3 border rounded-md ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                            type="tel"
                            value={registerForm.phone}
                            name="phone"
                            onChange={changeHandler}
                            placeholder="011-1234-5678"
                        />
                        {errors.phone && (
                            <span className="text-red-500 text-sm mt-1 block">{errors.phone}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white p-3 rounded-md font-medium hover:bg-gray-800"
                    >
                        Crear Cuenta
                    </button>

                    <div className="text-center pt-4">
                        <span className="text-gray-600 text-sm">
                            ¿Ya tienes cuenta?{" "}
                            <Link href="/login" className="text-blue-600 font-medium hover:underline">
                                Iniciar Sesión
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}