import { apiClient } from './api';
import type { User, Project, Task, Comment, HistoryEntry, Notification } from '@/types';

// Funciones para reemplazar localStorage con llamadas a la API

// Usuarios
export async function getUsers(): Promise<User[]> {
  return apiClient.getUsers();
}

export async function getUserByCredentials(
  username: string,
  password: string
): Promise<User | null> {
  try {
    const response = await apiClient.login(username, password);
    return response.user;
  } catch {
    return null;
  }
}

// Proyectos
export async function getProjects(): Promise<Project[]> {
  return apiClient.getProjects();
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    return await apiClient.getProject(id);
  } catch {
    return null;
  }
}

export async function addProject(project: Omit<Project, 'id'>): Promise<string> {
  const newProject = await apiClient.createProject(project);
  return newProject.id;
}

export async function updateProject(id: string, project: Omit<Project, 'id'>): Promise<boolean> {
  try {
    await apiClient.updateProject(id, project);
    return true;
  } catch {
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await apiClient.deleteProject(id);
    return true;
  } catch {
    return false;
  }
}

// Tareas
export async function getTasks(): Promise<Task[]> {
  return apiClient.getTasks();
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    return await apiClient.getTask(id);
  } catch {
    return null;
  }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const newTask = await apiClient.createTask(task);
  return newTask.id;
}

export async function updateTask(id: string, task: Partial<Task>): Promise<boolean> {
  try {
    await apiClient.updateTask(id, task);
    return true;
  } catch {
    return false;
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    await apiClient.deleteTask(id);
    return true;
  } catch {
    return false;
  }
}

// Comentarios
export async function getComments(): Promise<Comment[]> {
  return [];
}

export async function getCommentsByTaskId(taskId: string): Promise<Comment[]> {
  return apiClient.getComments(taskId);
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  const newComment = await apiClient.createComment(comment);
  return newComment.id;
}

// Historial
export async function getHistory(): Promise<HistoryEntry[]> {
  return apiClient.getHistory();
}

export async function getHistoryByTaskId(taskId: string): Promise<HistoryEntry[]> {
  return apiClient.getHistory(taskId);
}

export async function addHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<string> {
  const created = await apiClient.createHistory(entry);
  return created.id;
}

// Notificaciones
export async function getNotifications(): Promise<Notification[]> {
  return [];
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  return apiClient.getNotifications(userId);
}

export async function getUnreadNotificationsByUserId(userId: string): Promise<Notification[]> {
  return apiClient.getUnreadNotifications(userId);
}

export async function addNotification(
  notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
): Promise<string> {
  const created = await apiClient.createNotification(notification);
  return created.id;
}

export async function markNotificationsAsRead(userId: string): Promise<void> {
  void userId;
  return apiClient.markNotificationsAsRead();
}
