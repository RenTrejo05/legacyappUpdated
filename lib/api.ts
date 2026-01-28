import { Task, Project, User, Comment, Notification } from '@/types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(username: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  // Tasks
  async getTasks(params?: { projectId?: string; assignedTo?: string }): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo);
    
    const query = searchParams.toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id: string): Promise<Task> {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request(`/projects/${id}`);
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Omit<Project, 'id'>): Promise<Project> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Comments
  async getComments(taskId: string): Promise<Comment[]> {
    return this.request(`/comments?taskId=${taskId}`);
  }

  async createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // History
  async getHistory(taskId?: string) {
    return this.request(`/history${taskId ? `?taskId=${taskId}` : ''}`);
  }

  async createHistory(entry: any) {
    return this.request('/history', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.request(`/notifications?userId=${userId}`);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.request(`/notifications/unread?userId=${userId}`);
  }

  async createNotification(notification: any) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  async markNotificationsAsRead(): Promise<void> {
    return this.request('/notifications/mark-read', {
      method: 'PUT',
    });
  }

  async markNotificationAsRead(id: string): Promise<void> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }
}

export const apiClient = new ApiClient();
