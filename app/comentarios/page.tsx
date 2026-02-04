"use client";

import type { Comment, User, Task } from "@/types";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { title } from "@/components/primitives";

export default function ComentariosPage() {
  const { user } = useAuth();
  const [taskId, setTaskId] = useState<string>("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/tasks"),
        ]);

        if (usersRes.ok) {
          const usersData: User[] = await usersRes.json();
          setUsers(usersData);
        }

        if (tasksRes.ok) {
          const tasksData: Task[] = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    };

    loadAll();
  }, []);

  const loadComments = async () => {
    const id = parseInt(taskId);

    if (!id) {
      setComments([]);

      return;
    }

    try {
      const res = await fetch(`/api/comments?taskId=${id}`);

      if (!res.ok) {
        setComments([]);

        return;
      }
      const data: Comment[] = await res.json();

      setComments(data);
    } catch (e) {
      console.error("Error cargando comentarios:", e);
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

  const handleAddComment = async () => {
    const id = parseInt(taskId);

    if (!id) {
      alert("ID de tarea requerido");

      return;
    }

    if (!commentText.trim()) {
      alert("El comentario no puede estar vacío");

      return;
    }

    if (!user) return;

    try {
      const taskRes = await fetch(`/api/tasks/${id}`);

      if (!taskRes.ok) {
        alert("Tarea no encontrada");

        return;
      }
      (await taskRes.json()) as Task;

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: id,
          userId: user.id,
          commentText: commentText.trim(),
        }),
      });

      if (!res.ok) {
        alert("No se pudo agregar el comentario");

        return;
      }

      await notifyAdmins(
        `Usuario ${user.username} agregó un comentario en la tarea #${id}`,
      );

      setCommentText("");
      await loadComments();
    } catch (e) {
      console.error("Error agregando comentario:", e);
      alert("Error al agregar el comentario");
    }
  };

  const getUserName = (userId: number) => {
    const foundUser = users.find((u) => u.id === userId);

    return foundUser ? foundUser.username : "Usuario desconocido";
  };

  const getTaskTitle = (taskIdNum: number) => {
    const task = tasks.find((t) => t.id === taskIdNum);

    return task ? task.title : "Tarea desconocida";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h1 className={title()}>Comentarios de Tareas</h1>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Agregar Comentario</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <Select
                label="Tarea"
                placeholder="Selecciona una tarea"
                selectedKeys={taskId ? [taskId] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  setTaskId(selected ? String(selected) : "");
                  if (selected) {
                    // Auto-load comments when task is selected
                    setTimeout(() => {
                      const id = parseInt(String(selected));
                      if (id) {
                        fetch(`/api/comments?taskId=${id}`)
                          .then((res) => (res.ok ? res.json() : []))
                          .then((data: Comment[]) => setComments(data))
                          .catch(() => setComments([]));
                      }
                    }, 0);
                  } else {
                    setComments([]);
                  }
                }}
              >
                {tasks.map((task) => (
                  <SelectItem key={task.id}>
                    #{task.id} - {task.title}
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Comentario"
                minRows={3}
                placeholder="Escribe tu comentario aquí"
                value={commentText}
                variant="bordered"
                onValueChange={setCommentText}
              />

              <div className="flex gap-2">
                <Button color="primary" onPress={handleAddComment}>
                  Agregar Comentario
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Comentarios */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              Comentarios
              {taskId
                ? ` - #${taskId}: ${getTaskTitle(parseInt(taskId))}`
                : ""}
            </h2>
          </CardHeader>
          <CardBody>
            {!taskId ? (
              <p className="text-default-500">
                Selecciona una tarea para ver los comentarios
              </p>
            ) : comments.length === 0 ? (
              <p className="text-default-500">
                No hay comentarios para esta tarea
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {getUserName(comment.userId)}
                        </span>
                        <span className="text-xs text-default-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-default-700 whitespace-pre-wrap">
                      {comment.commentText}
                    </p>
                    <Divider />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
