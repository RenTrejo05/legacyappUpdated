"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
