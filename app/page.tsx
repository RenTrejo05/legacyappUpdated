"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { title } from "@/components/primitives";
import Link from "next/link";
import { Button } from "@heroui/button";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0,
    overdueTasks: 0,
    totalProjects: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const [tasksRes, projectsRes, notificationsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/projects"),
          fetch(`/api/notifications?userId=${user.id}&unread=1`),
        ]);

        if (!tasksRes.ok || !projectsRes.ok || !notificationsRes.ok) {
          return;
        }

        const tasks = await tasksRes.json();
        const projects = await projectsRes.json();
        const notifications = await notificationsRes.json();

        const completed = tasks.filter((t: any) => t.status === "Completada").length;
        const pending = tasks.filter((t: any) => t.status !== "Completada").length;
        const highPriority = tasks.filter(
          (t: any) => t.priority === "Alta" || t.priority === "Crítica",
        ).length;

        const now = new Date();
        const overdue = tasks.filter((t: any) => {
          if (!t.dueDate || t.status === "Completada") return false;
          const due = new Date(t.dueDate);
          return due < now;
        }).length;

        setStats({
          totalTasks: tasks.length,
          completedTasks: completed,
          pendingTasks: pending,
          highPriorityTasks: highPriority,
          overdueTasks: overdue,
          totalProjects: projects.length,
          unreadNotifications: notifications.length,
        });
      } catch (e) {
        console.error("Error cargando estadísticas del dashboard:", e);
      }
    };

    load();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className={title()}>Dashboard</h1>
          <p className="text-default-500 mt-2">
            Bienvenido, <strong>{user?.username}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-default-600">
                Total Tareas
              </p>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-default-600">
                Completadas
              </p>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold text-success">
                {stats.completedTasks}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-default-600">Pendientes</p>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold text-warning">
                {stats.pendingTasks}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-default-600">
                Alta Prioridad
              </p>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold text-danger">
                {stats.highPriorityTasks}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-default-600">Proyectos</p>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold">{stats.totalProjects}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-medium text-default-600">
                Notificaciones
              </p>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                {stats.unreadNotifications > 0 && (
                  <Chip color="danger" size="sm">
                    Nuevas
                  </Chip>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {stats.overdueTasks > 0 && (
          <Card className="border-danger">
            <CardHeader>
              <p className="text-sm font-medium text-danger">
                ⚠️ Tareas Vencidas
              </p>
            </CardHeader>
            <CardBody>
              <p className="text-2xl font-bold text-danger">
                {stats.overdueTasks}
              </p>
              <Button
                as={Link}
                href="/tareas"
                color="danger"
                variant="flat"
                className="mt-2"
              >
                Ver Tareas
              </Button>
            </CardBody>
          </Card>
        )}

        <div className="flex gap-2">
          <Button as={Link} href="/tareas" color="primary" variant="flat">
            Ver Todas las Tareas
          </Button>
          <Button as={Link} href="/proyectos" color="secondary" variant="flat">
            Ver Proyectos
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
