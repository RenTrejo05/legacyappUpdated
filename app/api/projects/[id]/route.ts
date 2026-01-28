import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Project from "@/lib/models/Project";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const project = await Project.findOne({ _id: params.id, ownerId: user.userId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updateData = await request.json();
  await connectDB();

  const project = await Project.findOneAndUpdate(
    { _id: params.id, ownerId: user.userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const project = await Project.findOneAndDelete({ _id: params.id, ownerId: user.userId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ message: "Project deleted successfully" });
}
