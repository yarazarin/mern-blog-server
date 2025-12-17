//server/addUser.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 20000
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const email = process.env.ADMIN_EMAIL;

async function createUser() {
  try {
    const user = new User({ username, password, email, isEmailVerified: true });
    await user.save();
    console.log('User created successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating user:', err);
    mongoose.connection.close();
  }
}

createUser();
