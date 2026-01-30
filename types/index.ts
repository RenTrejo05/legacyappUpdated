import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Tipos de entidades
export type UserRole = "user" | "admin";

export interface User {
  id: number;
  username: string;
  password: string;
  role?: UserRole; // por defecto "user"; solo admin puede crear usuarios
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status:
    | "Pendiente"
    | "En Progreso"
    | "Completada"
    | "Bloqueada"
    | "Cancelada";
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  projectId: number;
  assignedTo: number;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  commentText: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: number;
  taskId: number;
  userId: number;
  action:
    | "CREATED"
    | "STATUS_CHANGED"
    | "TITLE_CHANGED"
    | "DELETED"
    | "UPDATED";
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: "task_assigned" | "task_updated" | "task_completed" | "comment_added";
  read: boolean;
  createdAt: string;
}

// Tipos para formularios
export interface TaskFormData {
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  projectId: number;
  assignedTo: number;
  dueDate: string;
  estimatedHours: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
}

export interface CommentFormData {
  taskId: number;
  commentText: string;
}

export interface SearchFilters {
  text: string;
  status: Task["status"] | "";
  priority: Task["priority"] | "";
  projectId: number;
}
