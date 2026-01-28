"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
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
import { getTasks, getProjects } from "@/lib/storage-api";
import type { Task, SearchFilters } from "@/types";
import { title } from "@/components/primitives";

const STATUS_OPTIONS = [
  "",
  "Pendiente",
  "En Progreso",
  "Completada",
  "Bloqueada",
  "Cancelada",
];

const PRIORITY_OPTIONS = ["", "Baja", "Media", "Alta", "Crítica"];

const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  Pendiente: "default",
  "En Progreso": "primary",
  Completada: "success",
  Bloqueada: "warning",
  Cancelada: "danger",
};

const PRIORITY_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  Baja: "default",
  Media: "primary",
  Alta: "warning",
  Crítica: "danger",
};

export default function BusquedaPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    text: "",
    status: "",
    priority: "",
    projectId: "",
  });
  const [results, setResults] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      setProjects(await getProjects());
    })();
  }, []);

  const handleSearch = async () => {
    const allTasks = await getTasks();
    const filtered = allTasks.filter((task) => {
      // Filtro de texto
      if (filters.text) {
        const searchText = filters.text.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchText);
        const matchesDescription = task.description
          .toLowerCase()
          .includes(searchText);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Filtro de estado
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Filtro de prioridad
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Filtro de proyecto
      if (filters.projectId && task.projectId !== filters.projectId) {
        return false;
      }

      return true;
    });

    setResults(filtered);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Sin proyecto";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Búsqueda Avanzada</h1>

        {/* Formulario de Búsqueda */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Texto"
                placeholder="Buscar en título o descripción"
                value={filters.text}
                onValueChange={(value) =>
                  setFilters({ ...filters, text: value })
                }
                variant="bordered"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Estado"
                  selectedKeys={filters.status ? [filters.status] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setFilters({
                      ...filters,
                      status: (value || "") as Task["status"] | "",
                    });
                  }}
                  variant="bordered"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status}>
                      {status || "Todos"}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Prioridad"
                  selectedKeys={filters.priority ? [filters.priority] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setFilters({
                      ...filters,
                      priority: (value || "") as Task["priority"] | "",
                    });
                  }}
                  variant="bordered"
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority}>
                      {priority || "Todas"}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Proyecto"
                  selectedKeys={filters.projectId ? [filters.projectId] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setFilters({
                      ...filters,
                      projectId: value ? (value as string) : "",
                    });
                  }}
                  variant="bordered"
                  className="md:col-span-2"
                  items={[
                    { key: "", label: "Todos" },
                    ...projects.map((p) => ({ key: String(p.id), label: p.name })),
                  ]}
                >
                  {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                </Select>
              </div>

              <Button color="primary" onPress={handleSearch} size="lg">
                Buscar
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              Resultados ({results.length})
            </h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Resultados de búsqueda">
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>TÍTULO</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>PRIORIDAD</TableColumn>
                <TableColumn>PROYECTO</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No se encontraron resultados">
                {results.map((task) => (
                  <TableRow key={task.id}>
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
