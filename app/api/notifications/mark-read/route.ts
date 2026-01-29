import { NextResponse } from "next/server";

import { notificationsCollection } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as { userId?: number };

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 },
      );
    }

    const col = await notificationsCollection();

    await col.updateMany({ userId, read: false }, { $set: { read: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en /api/notifications/mark-read [POST]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
