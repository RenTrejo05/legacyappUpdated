"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useEffect, useState } from "react";
import Link from "next/link";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardModules } from "@/config/dashboard";
import { ModuleIcon, LockIcon } from "@/components/module-icons";
import { title } from "@/components/primitives";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    unreadNotifications: 0,
    overdueTasks: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [tasksRes, notificationsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch(`/api/notifications?userId=${user.id}&unread=1`),
        ]);
        if (!tasksRes.ok || !notificationsRes.ok) return;
        const tasks = await tasksRes.json();
        const notifications = await notificationsRes.json();
        const now = new Date();
        const overdue = tasks.filter(
          (t: { dueDate?: string; status: string }) =>
            t.dueDate && t.status !== "Completada" && new Date(t.dueDate) < now,
        ).length;
        setStats({
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t: { status: string }) => t.status === "Completada").length,
          unreadNotifications: notifications.length,
          overdueTasks: overdue,
        });
      } catch {
        // ignore
      }
    };
    load();
  }, [user]);

  const modulesToShow = dashboardModules.filter(
    (m) => !m.role || user?.role === "admin",
  );

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-2 py-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={title()}>Dashboard</h1>
            <p className="text-default-500 mt-1">
              Hola, <strong>{user?.username}</strong>
            </p>
          </div>
          {(stats.unreadNotifications > 0 || stats.overdueTasks > 0) && (
            <div className="flex gap-2">
              {stats.unreadNotifications > 0 && (
                <Chip color="primary" size="sm" variant="flat">
                  {stats.unreadNotifications} notificación
                  {stats.unreadNotifications !== 1 ? "es" : ""}
                </Chip>
              )}
              {stats.overdueTasks > 0 && (
                <Chip color="danger" size="sm" variant="flat">
                  {stats.overdueTasks} tarea
                  {stats.overdueTasks !== 1 ? "s" : ""} vencida
                  {stats.overdueTasks !== 1 ? "s" : ""}
                </Chip>
              )}
            </div>
          )}
        </div>

        <div className="bg-default-50/50 dark:bg-default-100/30 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {modulesToShow.map((module) => (
              <Link key={module.href} href={module.href} className="block">
                <Card
                  isPressable
                  className="h-full w-full border border-default-200/50 bg-default-50/80 dark:bg-default-100/40 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <CardBody className="flex flex-col items-center justify-center gap-3 p-6">
                    <div className="size-14 flex items-center justify-center text-default-600">
                      <ModuleIcon icon={module.icon} className="size-12" />
                    </div>
                    <div className="flex items-center gap-1.5 w-full justify-center">
                      <span className="font-medium text-default-800 text-center">
                        {module.label}
                      </span>
                      {module.role === "admin" && (
                        <LockIcon className="size-4 shrink-0 text-default-400" />
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-default-50/50 dark:bg-default-100/30 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-default-100/80 h-full">
              <CardBody className="py-6 flex flex-col justify-center">
                <p className="text-sm text-default-600">Total tareas</p>
                <p className="text-2xl font-semibold">{stats.totalTasks}</p>
              </CardBody>
            </Card>
            <Card className="bg-default-100/80 h-full">
              <CardBody className="py-6 flex flex-col justify-center">
                <p className="text-sm text-default-600">Completadas</p>
                <p className="text-2xl font-semibold text-success">
                  {stats.completedTasks}
                </p>
              </CardBody>
            </Card>
            <Card className="bg-default-100/80 h-full">
              <CardBody className="py-6 flex flex-col justify-center">
                <p className="text-sm text-default-600">Notificaciones</p>
                <p className="text-2xl font-semibold">
                  {stats.unreadNotifications}
                </p>
              </CardBody>
            </Card>
            <Card className="bg-default-100/80 h-full">
              <CardBody className="py-6 flex flex-col justify-center">
                <p className="text-sm text-default-600">Vencidas</p>
                <p className="text-2xl font-semibold text-danger">
                  {stats.overdueTasks}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
