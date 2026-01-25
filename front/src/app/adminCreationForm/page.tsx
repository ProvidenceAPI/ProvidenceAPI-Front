"use client";

import React from 'react'
import { useRequireAuth } from "src/hooks/useRequireAuth";
import AdminCreationFormTab from 'src/components/AdminCreationFormTab'

export default function AdminCreationFormPage() {
  const { isLoading } = useRequireAuth("superadmin");
  
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <AdminCreationFormTab/>
    </div>
  )
}