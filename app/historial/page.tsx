"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  getHistoryByTaskId,
  getHistory,
  getUsers,
} from "@/lib/storage";
import { title } from "@/components/primitives";

const ACTION_LABELS: Record<string, string> = {
  CREATED: "Creada",
  STATUS_CHANGED: "Estado Cambiado",
  TITLE_CHANGED: "Título Cambiado",
  DELETED: "Eliminada",
  UPDATED: "Actualizada",
};

const ACTION_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  CREATED: "success",
  STATUS_CHANGED: "primary",
  TITLE_CHANGED: "secondary",
  DELETED: "danger",
  UPDATED: "warning",
};

export default function HistorialPage() {
  const [taskId, setTaskId] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const users = getUsers();

  const loadHistory = () => {
    const id = parseInt(taskId);
    if (!id) {
      setHistory([]);
      return;
    }

    const taskHistory = getHistoryByTaskId(id);
    setHistory(taskHistory);
    setShowAll(false);
  };

  const loadAllHistory = () => {
    const allHistory = getHistory();
    // Mostrar los últimos 100, más recientes primero
    setHistory(allHistory.slice(-100).reverse());
    setShowAll(true);
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username : "Desconocido";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Historial de Cambios</h1>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Cargar Historial</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Input
                label="ID Tarea"
                type="number"
                placeholder="Ingresa el ID de la tarea"
                value={taskId}
                onValueChange={setTaskId}
                variant="bordered"
              />

              <div className="flex gap-2">
                <Button color="primary" onPress={loadHistory}>
                  Cargar Historial
                </Button>
                <Button variant="flat" onPress={loadAllHistory}>
                  Cargar Todo el Historial
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Historial */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {showAll
                ? "Historial Completo"
                : taskId
                  ? `Historial - Tarea #${taskId}`
                  : "Historial"}
            </h2>
          </CardHeader>
          <CardBody>
            {history.length === 0 ? (
              <p className="text-default-500">
                {taskId || showAll
                  ? "No hay historial disponible"
                  : "Ingresa un ID de tarea o carga todo el historial"}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {history.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Chip
                          color={ACTION_COLORS[entry.action] || "default"}
                          size="sm"
                          variant="flat"
                        >
                          {ACTION_LABELS[entry.action] || entry.action}
                        </Chip>
                        {!showAll && (
                          <span className="text-sm text-default-600">
                            Tarea #{entry.taskId}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-default-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p>
                        <strong>Usuario:</strong> {getUserName(entry.userId)}
                      </p>
                      {entry.oldValue && (
                        <p>
                          <strong>Antes:</strong>{" "}
                          <span className="text-default-500">
                            {entry.oldValue || "(vacío)"}
                          </span>
                        </p>
                      )}
                      {entry.newValue && (
                        <p>
                          <strong>Después:</strong>{" "}
                          <span className="text-default-600">
                            {entry.newValue || "(vacío)"}
                          </span>
                        </p>
                      )}
                    </div>
                    <Divider />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
