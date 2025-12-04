const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = await question('Enter email address: ');
    const newPassword = await question('Enter new password: ');

    if (!email || !newPassword) {
      console.log('❌ Email and password are required');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password directly in DB
    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    console.log(`\n✅ Password reset successful for ${email}`);
    console.log(`\n💡 You can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
