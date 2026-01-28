import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Notification from "@/lib/models/Notification";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const notification = await Notification.findOneAndUpdate(
    { _id: params.id, ownerId: user.userId, userId: user.userId },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json(notification);
}
