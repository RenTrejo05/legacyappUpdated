"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommentsByTaskId,
  addComment,
  getUsers,
  getTask,
} from "@/lib/storage-api";
import { title } from "@/components/primitives";

export default function ComentariosPage() {
  const { user } = useAuth();
  const [taskId, setTaskId] = useState<string>("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      setUsers(await getUsers());
    })();
  }, []);

  const loadComments = async () => {
    if (!taskId.trim()) {
      setComments([]);
      return;
    }

    const taskComments = await getCommentsByTaskId(taskId.trim());
    setComments(taskComments);
  };

  const handleAddComment = async () => {
    if (!taskId.trim()) {
      alert("ID de tarea requerido");
      return;
    }

    if (!commentText.trim()) {
      alert("El comentario no puede estar vacío");
      return;
    }

    if (!user) return;

    const task = await getTask(taskId.trim());
    if (!task) {
      alert("Tarea no encontrada");
      return;
    }

    await addComment({
      taskId: taskId.trim(),
      userId: user.id,
      commentText: commentText.trim(),
    } as any);

    setCommentText("");
    await loadComments();
  };

  const getUserName = (userId: string) => {
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
                type="text"
                placeholder="Ingresa el ID de la tarea"
                value={taskId}
                onValueChange={setTaskId}
                variant="bordered"
              />

              <Textarea
                label="Comentario"
                placeholder="Escribe tu comentario aquí"
                value={commentText}
                onValueChange={setCommentText}
                variant="bordered"
                minRows={3}
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
              <p className="text-default-500">No hay comentarios para esta tarea</p>
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
