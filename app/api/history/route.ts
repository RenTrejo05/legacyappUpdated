import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import HistoryEntry from "@/lib/models/HistoryEntry";
import Task from "@/lib/models/Task";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  await connectDB();

  if (taskId) {
    const task = await Task.findOne({ _id: taskId, ownerId: user.userId }).select("_id");
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const query: any = { ownerId: user.userId };
  if (taskId) query.taskId = taskId;

  const history = await HistoryEntry.find(query)
    .sort({ createdAt: -1 })
    .limit(taskId ? 500 : 100);

  return NextResponse.json(history);
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, action, oldValue, newValue } = await request.json();
  if (!taskId || !action) {
    return NextResponse.json({ error: "taskId and action are required" }, { status: 400 });
  }

  await connectDB();

  const task = await Task.findOne({ _id: taskId, ownerId: user.userId }).select("_id");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const entry = new HistoryEntry({
    ownerId: user.userId,
    taskId,
    userId: user.userId,
    action,
    oldValue: oldValue ?? "",
    newValue: newValue ?? "",
  });

  await entry.save();
  return NextResponse.json(entry, { status: 201 });
}
