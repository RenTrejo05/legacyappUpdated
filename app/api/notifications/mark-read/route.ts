import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Notification from "@/lib/models/Notification";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Notification.updateMany({ ownerId: user.userId, userId: user.userId, read: false }, { $set: { read: true } });
  return NextResponse.json({ message: "Notifications marked as read" });
}
