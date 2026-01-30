import type { Notification } from "@/types";

import { NextResponse } from "next/server";

import { notificationsCollection } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const unreadParam = searchParams.get("unread");

    const col = await notificationsCollection();

    // Usar Record<string, unknown> para permitir $in en la query
    const query: Record<string, unknown> = {};

    if (userIdParam) {
      const userIdNum = Number(userIdParam);
      if (!Number.isNaN(userIdNum)) {
        // Coincidir tanto si en la DB está guardado como number como string
        query.userId = { $in: [userIdNum, userIdParam] };
      }
    }
    if (unreadParam === "1") {
      query.read = false;
    }

    const notifications = await col
      .find<Notification>(query as Partial<Notification>)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error en /api/notifications [GET]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<
      Notification,
      "id" | "read" | "createdAt"
    >;

    if (!body.userId || !body.message || !body.type) {
      return NextResponse.json(
        { error: "userId, message y type son requeridos" },
        { status: 400 },
      );
    }

    const col = await notificationsCollection();
    const last = await col.find().sort({ id: -1 }).limit(1).next();
    const nextId = last ? (last.id ?? 0) + 1 : 1;
    const now = new Date().toISOString();

    // Asegurar que userId sea número (los formularios pueden enviar string)
    const userId = Number(body.userId);
    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { error: "userId debe ser un número válido" },
        { status: 400 },
      );
    }

    const newNotification: Notification = {
      ...body,
      userId,
      id: nextId,
      read: false,
      createdAt: now,
    };

    await col.insertOne(newNotification);

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/notifications [POST]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
