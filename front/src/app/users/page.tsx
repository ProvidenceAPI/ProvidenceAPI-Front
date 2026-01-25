"use client";

import React from "react";
import { useRequireAuth } from "src/hooks/useRequireAuth";
import UsersTab from "src/components/UsersTab";

export default function UsersPage() {
  const { isLoading } = useRequireAuth("admin");

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <UsersTab />
    </div>
  );
}
