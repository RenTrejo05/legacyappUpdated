const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const User = require('../lib/models/User');
const Project = require('../lib/models/Project');

async function initDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Crear usuarios iniciales
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.create([
        { username: 'admin', password: 'admin123' },
        { username: 'user1', password: 'user123' },
        { username: 'user2', password: 'user123' },
      ]);
      console.log('Users created successfully');
    }

    // Crear proyectos iniciales
    const existingProjects = await Project.countDocuments();
    if (existingProjects === 0) {
      await Project.create([
        { name: 'Proyecto Demo', description: 'Proyecto de ejemplo' },
        { name: 'Proyecto Alpha', description: 'Proyecto importante' },
        { name: 'Proyecto Beta', description: 'Proyecto secundario' },
      ]);
      console.log('Projects created successfully');
    }

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
