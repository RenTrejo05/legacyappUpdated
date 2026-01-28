import type {
  User,
  Project,
  Task,
  Comment,
  HistoryEntry,
  Notification,
} from "@/types";

// Clave para localStorage
const STORAGE_KEYS = {
  USERS: "users",
  PROJECTS: "projects",
  TASKS: "tasks",
  COMMENTS: "comments",
  HISTORY: "history",
  NOTIFICATIONS: "notifications",
  NEXT_TASK_ID: "nextTaskId",
  NEXT_PROJECT_ID: "nextProjectId",
} as const;

// Inicializar datos por defecto
export function initStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify([
        { id: 1, username: "admin", password: "admin" },
        { id: 2, username: "user1", password: "user1" },
        { id: 3, username: "user2", password: "user2" },
      ])
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(
      STORAGE_KEYS.PROJECTS,
      JSON.stringify([
        { id: 1, name: "Proyecto Demo", description: "Proyecto de ejemplo" },
        { id: 2, name: "Proyecto Alpha", description: "Proyecto importante" },
        { id: 3, name: "Proyecto Beta", description: "Proyecto secundario" },
      ])
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.NEXT_TASK_ID)) {
    localStorage.setItem(STORAGE_KEYS.NEXT_TASK_ID, "1");
  }

  if (!localStorage.getItem(STORAGE_KEYS.NEXT_PROJECT_ID)) {
    localStorage.setItem(STORAGE_KEYS.NEXT_PROJECT_ID, "4");
  }
}

// Usuarios
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
}

export function getUserByCredentials(
  username: string,
  password: string
): User | null {
  const users = getUsers();
  return users.find((u) => u.username === username && u.password === password) || null;
}

// Proyectos
export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || "[]");
}

export function getProject(id: number): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function addProject(project: Omit<Project, "id">): number {
  const projects = getProjects();
  const id = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_PROJECT_ID) || "1");
  const newProject: Project = { ...project, id };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  localStorage.setItem(STORAGE_KEYS.NEXT_PROJECT_ID, String(id + 1));
  return id;
}

export function updateProject(id: number, project: Omit<Project, "id">): boolean {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return false;
  projects[index] = { ...project, id };
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return true;
}

export function deleteProject(id: number): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  return true;
}

// Tareas
export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || "[]");
}

export function getTask(id: number): Task | null {
  const tasks = getTasks();
  return tasks.find((t) => t.id === id) || null;
}

export function addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): number {
  const tasks = getTasks();
  const id = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_TASK_ID) || "1");
  const now = new Date().toISOString();
  const newTask: Task = {
    ...task,
    id,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEYS.NEXT_TASK_ID, String(id + 1));
  return id;
}

export function updateTask(id: number, task: Partial<Task>): boolean {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks[index] = {
    ...tasks[index],
    ...task,
    id,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return true;
}

export function deleteTask(id: number): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  return true;
}

// Comentarios
export function getComments(): Comment[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || "[]");
}

export function getCommentsByTaskId(taskId: number): Comment[] {
  return getComments().filter((c) => c.taskId === taskId);
}

export function addComment(comment: Omit<Comment, "id" | "createdAt">): number {
  const comments = getComments();
  const id = comments.length + 1;
  const newComment: Comment = {
    ...comment,
    id,
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  return id;
}

// Historial
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
}

export function getHistoryByTaskId(taskId: number): HistoryEntry[] {
  return getHistory().filter((h) => h.taskId === taskId);
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "timestamp">): number {
  const history = getHistory();
  const id = history.length + 1;
  const newEntry: HistoryEntry = {
    ...entry,
    id,
    timestamp: new Date().toISOString(),
  };
  history.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  return id;
}

// Notificaciones
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
}

export function getNotificationsByUserId(userId: number): Notification[] {
  return getNotifications().filter((n) => n.userId === userId);
}

export function getUnreadNotificationsByUserId(userId: number): Notification[] {
  return getNotificationsByUserId(userId).filter((n) => !n.read);
}

export function addNotification(
  notification: Omit<Notification, "id" | "read" | "createdAt">
): number {
  const notifications = getNotifications();
  const id = notifications.length + 1;
  const newNotification: Notification = {
    ...notification,
    id,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  return id;
}

export function markNotificationsAsRead(userId: number): void {
  const notifications = getNotifications();
  notifications.forEach((n) => {
    if (n.userId === userId) {
      n.read = true;
    }
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}
