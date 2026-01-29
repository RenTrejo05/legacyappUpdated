import type { Comment } from "@/types";

import { NextResponse } from "next/server";

import { commentsCollection } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskIdParam = searchParams.get("taskId");
    const col = await commentsCollection();

    const query: Partial<Comment> = {};

    if (taskIdParam) {
      query.taskId = parseInt(taskIdParam);
    }

    const comments = await col.find<Comment>(query).sort({ id: 1 }).toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error en /api/comments [GET]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<Comment, "id" | "createdAt">;

    if (!body.taskId || !body.userId || !body.commentText) {
      return NextResponse.json(
        { error: "taskId, userId y commentText son requeridos" },
        { status: 400 },
      );
    }

    const col = await commentsCollection();
    const last = await col.find().sort({ id: -1 }).limit(1).next();
    const nextId = last ? (last.id ?? 0) + 1 : 1;
    const now = new Date().toISOString();

    const newComment: Comment = {
      ...body,
      id: nextId,
      createdAt: now,
    };

    await col.insertOne(newComment);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error en /api/comments [POST]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
