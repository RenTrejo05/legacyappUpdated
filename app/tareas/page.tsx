"use client";

import type { Task, TaskFormData, Project, User } from "@/types";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { title } from "@/components/primitives";

const STATUS_OPTIONS = [
  "Pendiente",
  "En Progreso",
  "Completada",
  "Bloqueada",
  "Cancelada",
];

const PRIORITY_OPTIONS = ["Baja", "Media", "Alta", "Crítica"];

const STATUS_COLORS: Record<
  string,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  Pendiente: "default",
  "En Progreso": "primary",
  Completada: "success",
  Bloqueada: "warning",
  Cancelada: "danger",
};

const PRIORITY_COLORS: Record<
  string,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  Baja: "default",
  Media: "primary",
  Alta: "warning",
  Crítica: "danger",
};

export default function TareasPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "Pendiente",
    priority: "Media",
    projectId: 0,
    assignedTo: 0,
    dueDate: "",
    estimatedHours: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    overdue: 0,
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [tasksRes, projectsRes, usersRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/projects"),
          fetch("/api/users"),
        ]);

        if (!tasksRes.ok || !projectsRes.ok || !usersRes.ok) return;

        const [tasksData, projectsData, usersData] = await Promise.all([
          tasksRes.json(),
          projectsRes.json(),
          usersRes.json(),
        ]);

        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
        updateStats(tasksData);
      } catch (e) {
        console.error("Error cargando datos de tareas:", e);
      }
    };

    loadAll();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");

      if (!res.ok) return;
      const loadedTasks: Task[] = await res.json();

      setTasks(loadedTasks);
      updateStats(loadedTasks);
    } catch (e) {
      console.error("Error recargando tareas:", e);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");

      if (!res.ok) return;
      const data: Project[] = await res.json();

      setProjects(data);
    } catch (e) {
      console.error("Error recargando proyectos:", e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users");

      if (!res.ok) return;
      const data: User[] = await res.json();

      setUsers(data);
    } catch (e) {
      console.error("Error recargando usuarios:", e);
    }
  };

  const getAdminUsers = async () => {
    if (users.length > 0) {
      return users.filter((u) => u.role === "admin");
    }

    try {
      const res = await fetch("/api/users");

      if (!res.ok) return [];
      const data: User[] = await res.json();

      setUsers(data);
      return data.filter((u) => u.role === "admin");
    } catch (e) {
      console.error("Error cargando admins:", e);
      return [];
    }
  };

  const notifyAdmins = async (message: string) => {
    if (!user || user.role === "admin") return;

    try {
      const admins = await getAdminUsers();

      if (admins.length === 0) return;

      await Promise.all(
        admins.map((admin) =>
          fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: admin.id,
              message,
              type: "admin_alert",
            }),
          }),
        ),
      );
    } catch (e) {
      console.error("Error notificando admins:", e);
    }
  };

  const updateStats = (taskList: Task[]) => {
    const total = taskList.length;
    const completed = taskList.filter((t) => t.status === "Completada").length;
    const pending = total - completed;
    const highPriority = taskList.filter(
      (t) => t.priority === "Alta" || t.priority === "Crítica",
    ).length;
    const now = new Date();
    const overdue = taskList.filter((t) => {
      if (!t.dueDate || t.status === "Completada") return false;

      return new Date(t.dueDate) < now;
    }).length;

    setStats({ total, completed, pending, highPriority, overdue });
  };

  const handleSelectTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return;
    setSelectedTaskId(taskId);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
    });
  };

  const handleClearForm = () => {
    setSelectedTaskId(null);
    setFormData({
      title: "",
      description: "",
      status: "Pendiente",
      priority: "Media",
      projectId: 0,
      assignedTo: 0,
      dueDate: "",
      estimatedHours: 0,
    });
  };

  const handleAddTask = async () => {
    if (!formData.title.trim()) {
      alert("El título es requerido");

      return;
    }

    if (!user) return;

    try {
      const taskRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          actualHours: 0,
          createdBy: user.id,
        }),
      });

      if (!taskRes.ok) {
        alert("No se pudo crear la tarea");

        return;
      }

      const createdTask: Task = await taskRes.json();

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: createdTask.id,
          userId: user.id,
          action: "CREATED",
          oldValue: "",
          newValue: formData.title,
        }),
      });

      if (formData.assignedTo > 0) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: formData.assignedTo,
            message: `Nueva tarea asignada: ${formData.title}`,
            type: "task_assigned",
          }),
        });
      }

      await notifyAdmins(
        `Usuario ${user.username} creó la tarea "${formData.title}"`,
      );

      await loadTasks();
      handleClearForm();
    } catch (e) {
      console.error("Error agregando tarea:", e);
      alert("Error al agregar la tarea");
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTaskId) {
      alert("Selecciona una tarea");

      return;
    }

    if (!formData.title.trim()) {
      alert("El título es requerido");

      return;
    }

    if (!user) return;

    const oldTask = tasks.find((t) => t.id === selectedTaskId);

    if (!oldTask) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...oldTask,
          ...formData,
        }),
      });

      if (!res.ok) {
        alert("No se pudo actualizar la tarea");

        return;
      }

      if (oldTask.status !== formData.status) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTaskId,
            userId: user.id,
            action: "STATUS_CHANGED",
            oldValue: oldTask.status,
            newValue: formData.status,
          }),
        });
      }

      if (oldTask.title !== formData.title) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTaskId,
            userId: user.id,
            action: "TITLE_CHANGED",
            oldValue: oldTask.title,
            newValue: formData.title,
          }),
        });
      }

      if (formData.assignedTo > 0) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: formData.assignedTo,
            message: `Tarea actualizada: ${formData.title}`,
            type: "task_updated",
          }),
        });
      }

      await notifyAdmins(
        `Usuario ${user.username} actualizó la tarea #${selectedTaskId}: "${formData.title}"`,
      );

      await loadTasks();
      handleClearForm();
    } catch (e) {
      console.error("Error actualizando tarea:", e);
      alert("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) {
      alert("Selecciona una tarea");

      return;
    }

    if (!user) return;

    const task = tasks.find((t) => t.id === selectedTaskId);

    if (!task) return;

    if (!confirm(`¿Eliminar tarea: ${task.title}?`)) {
      return;
    }

    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTaskId,
          userId: user.id,
          action: "DELETED",
          oldValue: task.title,
          newValue: "",
        }),
      });

      const res = await fetch(`/api/tasks/${selectedTaskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("No se pudo eliminar la tarea");

        return;
      }

      await notifyAdmins(
        `Usuario ${user.username} eliminó la tarea #${selectedTaskId}: "${task.title}"`,
      );

      await loadTasks();
      handleClearForm();
    } catch (e) {
      console.error("Error eliminando tarea:", e);
      alert("Error al eliminar la tarea");
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (!user) return;

    if (task.status === "Completada") return;

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completada" }),
      });

      if (!res.ok) {
        alert("No se pudo completar la tarea");

        return;
      }

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          userId: user.id,
          action: "STATUS_CHANGED",
          oldValue: task.status,
          newValue: "Completada",
        }),
      });

      if (task.assignedTo > 0) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: task.assignedTo,
            message: `Tarea completada: ${task.title}`,
            type: "task_completed",
          }),
        });
      }

      await notifyAdmins(
        `Usuario ${user.username} completó la tarea #${task.id}: "${task.title}"`,
      );

      if (selectedTaskId === task.id) {
        setFormData({
          title: task.title,
          description: task.description,
          status: "Completada",
          priority: task.priority,
          projectId: task.projectId,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
        });
      }

      await loadTasks();
    } catch (e) {
      console.error("Error completando tarea:", e);
      alert("Error al completar la tarea");
    }
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);

    return project ? project.name : "Sin proyecto";
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);

    return user ? user.username : "Sin asignar";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Gestión de Tareas</h1>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Estadísticas</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Chip variant="flat">Total: {stats.total}</Chip>
              <Chip color="success" variant="flat">
                Completadas: {stats.completed}
              </Chip>
              <Chip color="warning" variant="flat">
                Pendientes: {stats.pending}
              </Chip>
              <Chip color="danger" variant="flat">
                Alta Prioridad: {stats.highPriority}
              </Chip>
              {stats.overdue > 0 && (
                <Chip color="danger" variant="flat">
                  Vencidas: {stats.overdue}
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {selectedTaskId ? "Editar Tarea" : "Nueva Tarea"}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                label="Título"
                placeholder="Ingresa el título de la tarea"
                value={formData.title}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, title: value })
                }
              />

              <Textarea
                label="Descripción"
                minRows={3}
                placeholder="Ingresa la descripción"
                value={formData.description}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Estado"
                  selectedKeys={[formData.status]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;

                    setFormData({
                      ...formData,
                      status: value as Task["status"],
                    });
                  }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status}>{status}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Prioridad"
                  selectedKeys={[formData.priority]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;

                    setFormData({
                      ...formData,
                      priority: value as Task["priority"],
                    });
                  }}
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority}>{priority}</SelectItem>
                  ))}
                </Select>

                <Select
                  items={[
                    { key: "0", label: "Sin proyecto" },
                    ...projects.map((p) => ({
                      key: String(p.id),
                      label: p.name,
                    })),
                  ]}
                  label="Proyecto"
                  selectedKeys={
                    formData.projectId > 0 ? [String(formData.projectId)] : []
                  }
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];

                    setFormData({
                      ...formData,
                      projectId: value ? parseInt(value as string) : 0,
                    });
                  }}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>

                <Select
                  items={[
                    { key: "0", label: "Sin asignar" },
                    ...users.map((u) => ({
                      key: String(u.id),
                      label: u.username,
                    })),
                  ]}
                  label="Asignado a"
                  selectedKeys={
                    formData.assignedTo > 0 ? [String(formData.assignedTo)] : []
                  }
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];

                    setFormData({
                      ...formData,
                      assignedTo: value ? parseInt(value as string) : 0,
                    });
                  }}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>

                <Input
                  label="Fecha Vencimiento"
                  type="date"
                  value={formData.dueDate}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, dueDate: value })
                  }
                />

                <Input
                  label="Horas Estimadas"
                  step="0.5"
                  min="0"
                  type="number"
                  value={String(formData.estimatedHours)}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      estimatedHours: parseFloat(value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  color="primary"
                  isDisabled={!!selectedTaskId}
                  onPress={handleAddTask}
                >
                  Agregar
                </Button>
                <Button
                  color="secondary"
                  isDisabled={!selectedTaskId}
                  onPress={handleUpdateTask}
                >
                  Actualizar
                </Button>
                <Button
                  color="danger"
                  isDisabled={!selectedTaskId}
                  variant="flat"
                  onPress={handleDeleteTask}
                >
                  Eliminar
                </Button>
                <Button variant="light" onPress={handleClearForm}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de Tareas */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Lista de Tareas</h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Tabla de tareas" selectionMode="single">
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>TÍTULO</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>PRIORIDAD</TableColumn>
                <TableColumn>PROYECTO</TableColumn>
                <TableColumn>ASIGNADO</TableColumn>
                <TableColumn>VENCIMIENTO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No hay tareas">
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer"
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <TableCell>{task.id}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Chip
                        color={STATUS_COLORS[task.status]}
                        size="sm"
                        variant="flat"
                      >
                        {task.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={PRIORITY_COLORS[task.priority]}
                        size="sm"
                        variant="flat"
                      >
                        {task.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>{getProjectName(task.projectId)}</TableCell>
                    <TableCell>{getUserName(task.assignedTo)}</TableCell>
                    <TableCell>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "Sin fecha"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        isDisabled={task.status === "Completada"}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCompleteTask(task);
                        }}
                      >
                        {task.status === "Completada"
                          ? "Completada"
                          : "Marcar completada"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
