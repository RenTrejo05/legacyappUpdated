"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUnreadNotificationsByUserId,
  getNotificationsByUserId,
  markNotificationsAsRead,
} from "@/lib/storage-api";
import { title } from "@/components/primitives";

const TYPE_LABELS: Record<string, string> = {
  task_assigned: "Tarea Asignada",
  task_updated: "Tarea Actualizada",
  task_completed: "Tarea Completada",
  comment_added: "Comentario Agregado",
};

const TYPE_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  task_assigned: "primary",
  task_updated: "warning",
  task_completed: "success",
  comment_added: "secondary",
};

export default function NotificacionesPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    if (showAll) {
      const all = await getNotificationsByUserId(user.id);
      setNotifications(all);
    } else {
      const unread = await getUnreadNotificationsByUserId(user.id);
      setNotifications(unread);
    }
  };

  const handleMarkAsRead = async () => {
    if (!user) return;

    await markNotificationsAsRead(user.id);
    await loadNotifications();
  };

  useEffect(() => {
    void loadNotifications();
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
                variant="flat"
                onPress={handleMarkAsRead}
                isDisabled={notifications.length === 0 || showAll}
              >
                Marcar como Leídas
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Notificaciones */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {showAll ? "Todas las Notificaciones" : "Notificaciones No Leídas"}
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
                      <span className="text-xs text-default-500">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
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
