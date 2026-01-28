import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Comment from "@/lib/models/Comment";
import Task from "@/lib/models/Task";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId is required" }, { status: 400 });

  await connectDB();

  const task = await Task.findOne({ _id: taskId, ownerId: user.userId }).select("_id");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const comments = await Comment.find({ ownerId: user.userId, taskId })
    .sort({ createdAt: -1 });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, commentText } = await request.json();
  if (!taskId || !commentText) {
    return NextResponse.json({ error: "taskId and commentText are required" }, { status: 400 });
  }

  await connectDB();

  const task = await Task.findOne({ _id: taskId, ownerId: user.userId }).select("_id");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const comment = new Comment({
    ownerId: user.userId,
    taskId,
    userId: user.userId,
    commentText,
  });

  await comment.save();
  return NextResponse.json(comment, { status: 201 });
}
