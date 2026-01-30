"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { useAuth } from "@/contexts/AuthContext";
import { title } from "@/components/primitives";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-col gap-1 items-center pt-6">
          <h1 className={title({ size: "lg" })}>Task Manager</h1>
          <p className="text-small text-default-500 pt-2">
            Inicia sesión para continuar
          </p>
        </CardHeader>
        <CardBody className="pb-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              label="Usuario"
              placeholder="Ingresa tu usuario"
              value={username}
              variant="bordered"
              onValueChange={setUsername}
            />
            <Input
              isRequired
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              value={password}
              variant="bordered"
              onValueChange={setPassword}
            />

            {error && (
              <div className="text-danger text-sm text-center">{error}</div>
            )}

            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              Entrar
            </Button>

          </form>
        </CardBody>
      </Card>
    </div>
  );
}
