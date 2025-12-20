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

const username = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASS;
const email = process.env.ADMIN_EMAIL;

async function createOrUpdateUser() {
  try {
    let user = await User.findOne({ username });
    if (user) {
      user.email = email;
      user.isEmailVerified = true;
      await user.save();
      console.log('User updated successfully');
    } else {
      user = new User({ username, password, email, isEmailVerified: true });
      await user.save();
      console.log('User created successfully');
    }
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    mongoose.connection.close();
  }
}

createOrUpdateUser();
