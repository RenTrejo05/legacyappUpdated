"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useAuth } from "@/contexts/AuthContext";
import { title } from "@/components/primitives";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(username, password);
    
    if (success) {
      router.push("/");
    } else {
      setError("Credenciales inválidas. Intenta nuevamente.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-6">
          <h1 className={title({ size: "lg" })}>Task Manager</h1>
          <p className="text-small text-default-500">
            Inicia sesión para continuar
          </p>
        </CardHeader>
        <CardBody className="pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Usuario"
              placeholder="Ingresa tu usuario"
              value={username}
              onValueChange={setUsername}
              isRequired
              autoFocus
              variant="bordered"
            />
            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              value={password}
              onValueChange={setPassword}
              isRequired
              variant="bordered"
            />
            
            {error && (
              <div className="text-danger text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Entrar
            </Button>

            <div className="text-center text-small text-default-500">
              <p>Usuarios de prueba:</p>
              <p className="text-xs mt-1">
                admin/admin, user1/user1, user2/user2
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
