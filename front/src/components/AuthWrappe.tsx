// components/AuthWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import AuthProvider from "src/contexts/AuthContext";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Previene hidratación en servidor
  if (!isMounted) {
    return null;
  }

  return <AuthProvider>{children}</AuthProvider>;
}