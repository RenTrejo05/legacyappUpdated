import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Notification from "@/lib/models/Notification";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || user.userId;
  if (userId !== user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const notifications = await Notification.find({ ownerId: user.userId, userId, read: false })
    .sort({ createdAt: -1 });

  return NextResponse.json(notifications);
}
