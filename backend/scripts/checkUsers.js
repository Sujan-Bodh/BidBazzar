const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('username email isEmailVerified isPhoneVerified accountActive createdAt');

    console.log('\n📊 Total Users:', users.length);
    console.log('\n👥 User List:\n');

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 Tip: Register a new account at http://localhost:3000/register\n');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Email Verified: ${user.isEmailVerified ? '✅' : '❌'}`);
        console.log(`   Phone Verified: ${user.isPhoneVerified ? '✅' : '❌'}`);
        console.log(`   Account Active: ${user.accountActive ? '✅' : '❌'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });

      console.log('💡 To login, use one of the emails above with the password you registered with\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
