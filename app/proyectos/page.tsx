"use client";

import type { Project, ProjectFormData } from "@/types";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { title } from "@/components/primitives";

export default function ProyectosPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
  });
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");

      if (!res.ok) return;
      const data: Project[] = await res.json();

      setProjects(data);
    } catch (e) {
      console.error("Error cargando proyectos:", e);
    }
  };

  const getAdminUsers = async () => {
    try {
      const res = await fetch("/api/users");

      if (!res.ok) return [];
      const data = (await res.json()) as Array<{ id: number; role?: string }>;

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

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
    });
  };

  const handleClearForm = () => {
    setSelectedProjectId(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleAddProject = async () => {
    if (!formData.name.trim()) {
      alert("El nombre es requerido");

      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("No se pudo crear el proyecto");

        return;
      }

      await notifyAdmins(
        `Usuario ${user?.username ?? ""} creó el proyecto "${formData.name}"`,
      );

      await loadProjects();
      handleClearForm();
    } catch (e) {
      console.error("Error agregando proyecto:", e);
      alert("Error al agregar el proyecto");
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProjectId) {
      alert("Selecciona un proyecto");

      return;
    }

    if (!formData.name.trim()) {
      alert("El nombre es requerido");

      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("No se pudo actualizar el proyecto");

        return;
      }

      await notifyAdmins(
        `Usuario ${user?.username ?? ""} actualizó el proyecto #${selectedProjectId}: "${formData.name}"`,
      );

      await loadProjects();
      handleClearForm();
    } catch (e) {
      console.error("Error actualizando proyecto:", e);
      alert("Error al actualizar el proyecto");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) {
      alert("Selecciona un proyecto");

      return;
    }

    const project = projects.find((p) => p.id === selectedProjectId);

    if (!project) return;

    if (!confirm(`¿Eliminar proyecto: ${project.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("No se pudo eliminar el proyecto");

        return;
      }

      await notifyAdmins(
        `Usuario ${user?.username ?? ""} eliminó el proyecto #${selectedProjectId}: "${project.name}"`,
      );

      await loadProjects();
      handleClearForm();
    } catch (e) {
      console.error("Error eliminando proyecto:", e);
      alert("Error al eliminar el proyecto");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Gestión de Proyectos</h1>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {selectedProjectId ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                label="Nombre"
                placeholder="Ingresa el nombre del proyecto"
                value={formData.name}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, name: value })
                }
              />

              <Textarea
                label="Descripción"
                minRows={3}
                placeholder="Ingresa la descripción del proyecto"
                value={formData.description}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
              />

              <div className="flex gap-2 flex-wrap">
                <Button
                  color="primary"
                  isDisabled={!!selectedProjectId}
                  onPress={handleAddProject}
                >
                  Agregar
                </Button>
                <Button
                  color="secondary"
                  isDisabled={!selectedProjectId}
                  onPress={handleUpdateProject}
                >
                  Actualizar
                </Button>
                <Button
                  color="danger"
                  isDisabled={!selectedProjectId}
                  variant="flat"
                  onPress={handleDeleteProject}
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

        {/* Tabla de Proyectos */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Lista de Proyectos</h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Tabla de proyectos">
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No hay proyectos">
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer"
                    onClick={() => handleSelectProject(project)}
                  >
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.description || "-"}</TableCell>
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
