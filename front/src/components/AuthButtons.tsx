import { useRouter } from "next/navigation";

export default function AuthButtons() {
  const router = useRouter();
  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={() => router.push("/login")}
        className="text-red-600 hover:text-white-900 transition-all duration-300 font-light text-sm tracking-wide hover:bg-gray-100 px-4 py-2 rounded-full"
      >
        Iniciar Sesión
      </button>
      <button
        onClick={() => router.push("/register")}
        className="bg-black text-white px-6 py-2 rounded-full font-light text-sm tracking-wide hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        Unite Ahora
      </button>
    </div>
  );
}
