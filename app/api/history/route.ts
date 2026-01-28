import { NextResponse } from "next/server";
import { historyCollection } from "@/lib/db";
import type { HistoryEntry } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskIdParam = searchParams.get("taskId");
    const limitParam = searchParams.get("limit");

    const col = await historyCollection();

    const query: Partial<HistoryEntry> = {};
    if (taskIdParam) {
      query.taskId = parseInt(taskIdParam);
    }

    let cursor = col.find<HistoryEntry>(query).sort({ timestamp: -1 });

    if (limitParam) {
      const limit = parseInt(limitParam);
      if (!Number.isNaN(limit) && limit > 0) {
        cursor = cursor.limit(limit);
      }
    }

    const history = await cursor.toArray();
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error en /api/history [GET]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<
      HistoryEntry,
      "id" | "timestamp"
    >;

    if (!body.taskId || !body.userId || !body.action) {
      return NextResponse.json(
        { error: "taskId, userId y action son requeridos" },
        { status: 400 },
      );
    }

    const col = await historyCollection();
    const last = await col.find().sort({ id: -1 }).limit(1).next();
    const nextId = last ? (last.id ?? 0) + 1 : 1;
    const now = new Date().toISOString();

    const newEntry: HistoryEntry = {
      ...body,
      id: nextId,
      timestamp: now,
    };

    await col.insertOne(newEntry);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error en /api/history [POST]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

