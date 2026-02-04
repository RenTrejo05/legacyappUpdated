"use client";

import type { Notification } from "@/types";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { title } from "@/components/primitives";

const TYPE_LABELS: Record<string, string> = {
  task_assigned: "Tarea Asignada",
  task_updated: "Tarea Actualizada",
  task_completed: "Tarea Completada",
  comment_added: "Comentario Agregado",
};

const TYPE_COLORS: Record<
  string,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  task_assigned: "primary",
  task_updated: "warning",
  task_completed: "success",
  comment_added: "secondary",
};

export default function NotificacionesPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const query = showAll
        ? `userId=${user.id}`
        : `userId=${user.id}&unread=1`;
      const res = await fetch(`/api/notifications?${query}`);

      if (!res.ok) {
        setNotifications([]);

        return;
      }
      const data: Notification[] = await res.json();

      setNotifications(data);
    } catch (e) {
      console.error("Error cargando notificaciones:", e);
    }
  };

  const handleMarkAsRead = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        alert("No se pudieron marcar como leídas");

        return;
      }
      await loadNotifications();
    } catch (e) {
      console.error("Error marcando notificaciones como leídas:", e);
      alert("Error al marcar como leídas");
    }
  };

  const handleMarkSingleAsRead = async (notificationId: number) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (!res.ok) {
        alert("No se pudo marcar la notificación como leída");

        return;
      }

      await loadNotifications();
    } catch (e) {
      console.error("Error marcando notificación como leída:", e);
      alert("Error al marcar la notificación como leída");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [showAll, user]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Notificaciones</h1>

        {/* Controles */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Opciones</h2>
          </CardHeader>
          <CardBody>
            <div className="flex gap-2">
              <Button
                color="primary"
                variant={!showAll ? "solid" : "flat"}
                onPress={() => {
                  setShowAll(false);
                }}
              >
                No Leídas
              </Button>
              <Button
                color="secondary"
                variant={showAll ? "solid" : "flat"}
                onPress={() => {
                  setShowAll(true);
                }}
              >
                Todas
              </Button>
              <Button
                color="success"
                isDisabled={notifications.length === 0 || showAll}
                variant="flat"
                onPress={handleMarkAsRead}
              >
                Marcar Todas Como Leídas
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Notificaciones */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {showAll
                ? "Todas las Notificaciones"
                : "Notificaciones No Leídas"}
            </h2>
          </CardHeader>
          <CardBody>
            {notifications.length === 0 ? (
              <p className="text-default-500">
                {showAll
                  ? "No hay notificaciones"
                  : "No hay notificaciones nuevas"}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Chip
                          color={TYPE_COLORS[notif.type] || "default"}
                          size="sm"
                          variant="flat"
                        >
                          {TYPE_LABELS[notif.type] || notif.type}
                        </Chip>
                        {!notif.read && (
                          <Chip color="danger" size="sm" variant="dot">
                            Nueva
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-default-500">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                        {!notif.read && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="success"
                            onPress={() => handleMarkSingleAsRead(notif.id)}
                          >
                            Marcar leída
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-default-700">{notif.message}</p>
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
