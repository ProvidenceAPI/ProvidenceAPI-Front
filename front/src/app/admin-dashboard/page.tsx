"use client";

import React from "react";
import NavigationTab from "src/components/NavigationTab";
import { useRequireAuth } from "src/hooks/useRequireAuth";

export default function AdminDashboard() {
  const {isLoading} = useRequireAuth ("admin");

  if (isLoading) return <div>Cargando ..</div>
  return (
    <div>
      <NavigationTab />
    </div>
  );
}
