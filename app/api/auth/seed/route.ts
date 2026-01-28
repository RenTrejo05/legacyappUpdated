import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User';
import Project from '@/lib/models/Project';
import Task from '@/lib/models/Task';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Crear usuarios iniciales
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.create([
        { username: 'admin', password: 'admin123' },
        { username: 'user1', password: 'user123' },
        { username: 'user2', password: 'user123' },
      ]);
    }

    const users = await User.find();

    // Crear proyectos iniciales
    for (const u of users) {
      const existingProjects = await Project.countDocuments({ ownerId: u._id });
      if (existingProjects === 0) {
        await Project.create([
          { ownerId: u._id, name: 'Proyecto Demo', description: 'Proyecto de ejemplo' },
          { ownerId: u._id, name: 'Proyecto Alpha', description: 'Proyecto importante' },
          { ownerId: u._id, name: 'Proyecto Beta', description: 'Proyecto secundario' },
        ]);
      }

      const firstProject = await Project.findOne({ ownerId: u._id }).sort({ createdAt: 1 });
      const existingTasks = await Task.countDocuments({ ownerId: u._id });
      if (firstProject && existingTasks === 0) {
        await Task.create([
          {
            ownerId: u._id,
            title: 'Tarea de ejemplo',
            description: 'Primera tarea de ejemplo',
            status: 'Pendiente',
            priority: 'Media',
            projectId: firstProject._id,
            assignedTo: u._id,
            createdBy: u._id,
            estimatedHours: 2,
            actualHours: 0,
          },
        ]);
      }
    }

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
