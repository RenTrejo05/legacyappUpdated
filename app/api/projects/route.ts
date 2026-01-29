import type { Project } from "@/types";

import { NextResponse } from "next/server";

import { projectsCollection } from "@/lib/db";

export async function GET() {
  try {
    const col = await projectsCollection();
    const projects = await col.find<Project>({}).sort({ id: 1 }).toArray();

    return NextResponse.json(projects);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/projects [GET]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<Project, "id">;

    if (!body.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const col = await projectsCollection();
    const last = await col.find().sort({ id: -1 }).limit(1).next();
    const nextId = last ? (last.id ?? 0) + 1 : 1;

    const newProject: Project = {
      id: nextId,
      name: body.name,
      description: body.description ?? "",
    };

    await col.insertOne(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/projects [POST]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
