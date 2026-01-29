import { useRouter } from "next/navigation";

export default function AuthButtons() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 items-center">
      <button
        onClick={() => router.push("/login")}
        className="text-red-600 hover:text-red-700 transition-all duration-300 font-light text-xs xs:text-sm tracking-wide hover:bg-gray-100 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full whitespace-nowrap border border-red-600 hover:border-red-700 xs:border-0"
        aria-label="Iniciar Sesión"
      >
        <span className="hidden xs:inline">Iniciar Sesión</span>
        <span className="xs:hidden">Login</span>
      </button>
      <button
        onClick={() => router.push("/register")}
        className="bg-black text-white px-4 xs:px-5 sm:px-6 py-1.5 xs:py-2 rounded-full font-light text-xs xs:text-sm tracking-wide hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
        aria-label="Unirse a la plataforma"
      >
        <span className="hidden xs:inline">Unite Ahora</span>
        <span className="xs:hidden">Registro</span>
      </button>
    </div>
  );
}