require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const createTestAdmin = async () => {
  try {
    await connectDB();

    const email = "admin.test@intelliflow.com";

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      existingUser.role = "ADMIN";
      existingUser.isActive = true;

      await existingUser.save();

      console.log("Existing user updated to ADMIN.");
      console.log(`Email: ${email}`);
      console.log("Password: Test@12345");

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Test@12345",
      10
    );

    await User.create({
      name: "Admin Test",
      email,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });

    console.log("Test ADMIN created successfully.");
    console.log(`Email: ${email}`);
    console.log("Password: Test@12345");

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to create test admin:",
      error.message
    );

    process.exit(1);
  }
};

createTestAdmin();