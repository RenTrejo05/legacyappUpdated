import { NextResponse } from "next/server";
import { tasksCollection } from "@/lib/db";
import type { Task } from "@/types";

export async function GET() {
  try {
    const col = await tasksCollection();
    const tasks = await col.find<Task>({}).sort({ id: 1 }).toArray();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error en /api/tasks [GET]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<
      Task,
      "id" | "createdAt" | "updatedAt"
    > & { createdBy: number };

    if (!body.title) {
      return NextResponse.json(
        { error: "El título es requerido" },
        { status: 400 },
      );
    }

    const col = await tasksCollection();
    const last = await col.find().sort({ id: -1 }).limit(1).next();
    const nextId = last ? (last.id ?? 0) + 1 : 1;

    const now = new Date().toISOString();

    const newTask: Task = {
      ...body,
      id: nextId,
      createdAt: now,
      updatedAt: now,
      actualHours: body.actualHours ?? 0,
    };

    await col.insertOne(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error en /api/tasks [POST]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

