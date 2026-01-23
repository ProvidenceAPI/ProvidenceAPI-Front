// app/login/page.tsx - VERSIÓN SIMPLIFICADA Y CORRECTA
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "src/contexts/AppContext";
import LoginForm from "src/components/LoginForm";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, authLoading } = useAppContext();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = searchParams.get("redirect");

      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  if (isAuthenticated) {
    return null;
  }
  return <LoginForm />;
}

const LoginFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
);

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
