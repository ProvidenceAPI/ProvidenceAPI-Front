"use client";

import React from "react";
import TurnsTab from "src/components/TurnsTab";
import { useRequireAuth } from "src/hooks/useRequireAuth";
import { useAuth } from "src/hooks/useAuth";

export default function TurnsPage() {
  const { isLoading } = useRequireAuth("admin");
  const { user, role, isAdmin } = useAuth();

  console.log("User:", user);
  console.log("Role:", role);
  console.log("isAdmin:", isAdmin);

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <TurnsTab />
    </div>
  );
}
