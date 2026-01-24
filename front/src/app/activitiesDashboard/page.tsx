"use client";

import React from "react";
import { useRequireAuth } from "src/hooks/useRequireAuth";
import ActivityTab from "src/components/ActivityTab";

export default function ActivitiesPage() {
  const { isLoading } = useRequireAuth("admin");
  
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <ActivityTab />
    </div>
  );
}