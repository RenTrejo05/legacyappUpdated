import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Tipos de entidades
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "Pendiente" | "En Progreso" | "Completada" | "Bloqueada" | "Cancelada";
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  projectId: string;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  commentText: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  taskId: string;
  userId: string;
  action: "CREATED" | "STATUS_CHANGED" | "TITLE_CHANGED" | "DELETED" | "UPDATED";
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
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
  projectId: string;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
}

export interface CommentFormData {
  taskId: string;
  commentText: string;
}

export interface SearchFilters {
  text: string;
  status: Task["status"] | "";
  priority: Task["priority"] | "";
  projectId: string;
}
