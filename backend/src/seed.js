require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Prompt = require('./models/Prompt');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dear-sunday-v2');
  console.log('Connected');

  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@dearsunday.app',
      password: process.env.ADMIN_PASSWORD || 'SundayAdmin2024!',
      name: 'Sunday Admin'
    });
    console.log('Admin created');
  }

  const promptCount = await Prompt.countDocuments();
  if (promptCount === 0) {
    await Prompt.create({
      title: 'Write a letter to the version of yourself from one year ago.',
      body: 'What would you tell them? What do they need to hear? What are you proud of? Be honest, be kind.',
      weekOf: new Date(),
      isActive: true,
      submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    console.log('Starter prompt created');
  }

  console.log('Seed complete ✨');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
