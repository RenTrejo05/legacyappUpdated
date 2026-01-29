import type { Task } from "@/types";

import { NextResponse } from "next/server";

import { tasksCollection } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const col = await tasksCollection();
    const task = await col.findOne<Task>({ id: taskId });

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/tasks/[id] [GET]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const body = (await request.json()) as Partial<Task>;

    const col = await tasksCollection();
    const existing = await col.findOne<Task>({ id: taskId });

    if (!existing) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 },
      );
    }

    const updated: Task = {
      ...existing,
      ...body,
      id: taskId,
      updatedAt: new Date().toISOString(),
    };

    await col.replaceOne({ id: taskId }, updated);

    return NextResponse.json(updated);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/tasks/[id] [PUT]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    const col = await tasksCollection();
    const result = await col.deleteOne({ id: taskId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/tasks/[id] [DELETE]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
