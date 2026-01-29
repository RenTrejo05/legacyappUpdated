"use client";

import type { Comment, User, Task } from "@/types";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
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

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/users");

        if (!res.ok) return;
        const data: User[] = await res.json();

        setUsers(data);
      } catch (e) {
        console.error("Error cargando usuarios:", e);
      }
    };

    loadUsers();
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
              <Input
                label="ID Tarea"
                placeholder="Ingresa el ID de la tarea"
                type="number"
                value={taskId}
                variant="bordered"
                onValueChange={setTaskId}
              />

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
                <Button variant="flat" onPress={loadComments}>
                  Cargar Comentarios
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Comentarios */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              Comentarios {taskId ? `- Tarea #${taskId}` : ""}
            </h2>
          </CardHeader>
          <CardBody>
            {!taskId ? (
              <p className="text-default-500">
                Ingresa un ID de tarea para ver los comentarios
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
