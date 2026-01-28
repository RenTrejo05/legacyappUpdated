"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Code } from "@heroui/code";
import { getTasks, getProjects, getUsers } from "@/lib/storage-api";
import { title } from "@/components/primitives";

export default function ReportesPage() {
  const [report, setReport] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");

  const generateReport = async (type: "tasks" | "projects" | "users") => {
    setReportType(type);
    let reportText = `=== REPORTE: ${type.toUpperCase()} ===\n\n`;

    if (type === "tasks") {
      const tasks = await getTasks();
      const statusCount: Record<string, number> = {};
      
      tasks.forEach((task) => {
        const status = task.status || "Pendiente";
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      reportText += "Tareas por Estado:\n";
      Object.keys(statusCount).forEach((status) => {
        reportText += `  ${status}: ${statusCount[status]} tareas\n`;
      });

      reportText += "\nTareas por Prioridad:\n";
      const priorityCount: Record<string, number> = {};
      tasks.forEach((task) => {
        const priority = task.priority || "Media";
        priorityCount[priority] = (priorityCount[priority] || 0) + 1;
      });
      Object.keys(priorityCount).forEach((priority) => {
        reportText += `  ${priority}: ${priorityCount[priority]} tareas\n`;
      });

      reportText += `\nTotal de Tareas: ${tasks.length}\n`;
    } else if (type === "projects") {
      const projects = await getProjects();
      const tasks = await getTasks();

      reportText += "Tareas por Proyecto:\n";
      projects.forEach((project) => {
        const count = tasks.filter((t) => t.projectId === project.id).length;
        reportText += `  ${project.name}: ${count} tareas\n`;
      });

      reportText += `\nTotal de Proyectos: ${projects.length}\n`;
    } else if (type === "users") {
      const users = await getUsers();
      const tasks = await getTasks();

      reportText += "Tareas por Usuario:\n";
      users.forEach((user) => {
        const count = tasks.filter((t) => t.assignedTo === user.id).length;
        reportText += `  ${user.username}: ${count} tareas asignadas\n`;
      });

      reportText += `\nTotal de Usuarios: ${users.length}\n`;
    }

    setReport(reportText);
  };

  const exportCSV = async () => {
    const tasks = await getTasks();
    const projects = await getProjects();
    const users = await getUsers();

    let csv = "ID,Título,Estado,Prioridad,Proyecto,Asignado a,Fecha Vencimiento\n";

    tasks.forEach((task) => {
      const project = projects.find((p) => p.id === task.projectId);
      const user = users.find((u) => u.id === task.assignedTo);

      csv += `${task.id},"${task.title}","${task.status || "Pendiente"}","${task.priority || "Media"}","${project ? project.name : "Sin proyecto"}","${user ? user.username : "Sin asignar"}","${task.dueDate || "Sin fecha"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "export_tasks.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Generación de Reportes</h1>

        {/* Botones de Generación */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Generar Reporte</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              <Button
                color="primary"
                onPress={() => void generateReport("tasks")}
              >
                Reporte de Tareas
              </Button>
              <Button
                color="secondary"
                onPress={() => void generateReport("projects")}
              >
                Reporte de Proyectos
              </Button>
              <Button
                color="success"
                onPress={() => void generateReport("users")}
              >
                Reporte de Usuarios
              </Button>
              <Button color="warning" variant="flat" onPress={() => void exportCSV()}>
                Exportar a CSV
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Visualización del Reporte */}
        {report && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Reporte: {reportType.toUpperCase()}
              </h2>
            </CardHeader>
            <CardBody>
              <Code
                className="w-full whitespace-pre-wrap p-4"
                color="default"
                size="sm"
              >
                {report}
              </Code>
            </CardBody>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
