require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Charity = require('../models/Charity');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Clear
  await User.deleteMany({});
  await Charity.deleteMany({});

  // Admin user
  await User.create({
    fullName: 'Admin User',
    email: 'admin@golfheroes.com',
    password: 'Admin@1234',
    role: 'admin',
  });

  // Test subscriber
  await User.create({
    fullName: 'Test Subscriber',
    email: 'user@golfheroes.com',
    password: 'User@1234',
    role: 'subscriber',
  });

  // Charities
  await Charity.insertMany([
    {
      name: 'Cancer Research UK',
      description: 'Funding life-saving cancer research across the UK and beyond.',
      logoUrl: 'https://via.placeholder.com/100',
      websiteUrl: 'https://www.cancerresearchuk.org',
      isFeatured: true,
      totalRaised: 15200,
    },
    {
      name: 'British Heart Foundation',
      description: 'Fighting heart and circulatory diseases that devastate families.',
      logoUrl: 'https://via.placeholder.com/100',
      websiteUrl: 'https://www.bhf.org.uk',
      isFeatured: true,
      totalRaised: 9800,
    },
    {
      name: 'Mind Mental Health',
      description: 'Providing advice and support to empower anyone experiencing a mental health problem.',
      logoUrl: 'https://via.placeholder.com/100',
      websiteUrl: 'https://www.mind.org.uk',
      isFeatured: false,
      totalRaised: 4500,
    },
    {
      name: 'Age UK',
      description: 'Working to make later life the best it can be for everyone.',
      logoUrl: 'https://via.placeholder.com/100',
      websiteUrl: 'https://www.ageuk.org.uk',
      isFeatured: false,
      totalRaised: 3100,
    },
  ]);

  console.log('✅ Seed complete!');
  console.log('Admin  → admin@golfheroes.com / Admin@1234');
  console.log('User   → user@golfheroes.com  / User@1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
