import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Task from '@/lib/models/Task';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assignedTo = searchParams.get('assignedTo');
    
    let query: any = { ownerId: user.userId };
    if (projectId) query.projectId = projectId;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskData = await request.json();
    
    await connectDB();
    
    const task = new Task({
      ...taskData,
      ownerId: user.userId,
      createdBy: user.userId,
      assignedTo: taskData.assignedTo || user.userId,
    });
    
    await task.save();
    
    const createdTask = await Task.findById(task._id);
    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
