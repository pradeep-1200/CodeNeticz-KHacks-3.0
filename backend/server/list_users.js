'use strict';
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const users = await User.find({});
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, isActive: ${u.isActive}`);
  });
  await mongoose.disconnect();
}
run().catch(console.error);
