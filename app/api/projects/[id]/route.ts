import { NextResponse } from "next/server";
import { projectsCollection } from "@/lib/db";
import type { Project } from "@/types";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const projectId = parseInt(params.id);
    const col = await projectsCollection();
    const project = await col.findOne<Project>({ id: projectId });
    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error en /api/projects/[id] [GET]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const projectId = parseInt(params.id);
    const body = (await request.json()) as Omit<Project, "id">;

    if (!body.name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    const col = await projectsCollection();
    const result = await col.findOneAndUpdate(
      { id: projectId },
      {
        $set: {
          name: body.name,
          description: body.description ?? "",
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en /api/projects/[id] [PUT]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const projectId = parseInt(params.id);
    const col = await projectsCollection();
    const result = await col.deleteOne({ id: projectId });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/projects/[id] [DELETE]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

