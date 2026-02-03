import type { Notification } from "@/types";

import { NextResponse } from "next/server";

import { notificationsCollection } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const notificationId = parseInt(id);

    if (Number.isNaN(notificationId)) {
      return NextResponse.json(
        { error: "id debe ser un número válido" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Partial<Notification> | undefined;

    const col = await notificationsCollection();
    const existing = await col.findOne<Notification>({ id: notificationId });

    if (!existing) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 },
      );
    }

    const updateData: Partial<Notification> = {
      ...body,
    };

    if ("_id" in updateData) {
      delete (updateData as any)._id;
    }

    await col.updateOne({ id: notificationId }, { $set: updateData });

    const updated = await col.findOne<Notification>({ id: notificationId });

    return NextResponse.json(updated);
  } catch (error) {
    // eslint-disable-next-line no-console -- logging server errors for debugging
    console.error("Error en /api/notifications/[id] [PATCH]", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
