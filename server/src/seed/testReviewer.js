require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const createTestReviewer = async () => {
  try {
    await connectDB();

    const email = "reviewer.test@intelliflow.com";

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      existingUser.role = "REVIEWER";
      existingUser.isActive = true;
      await existingUser.save();

      console.log("Existing user updated to REVIEWER.");
      console.log(`Email: ${email}`);
      console.log("Password: Test@12345");

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Test@12345",
      10
    );

    await User.create({
      name: "Reviewer Test",
      email,
      password: hashedPassword,
      role: "REVIEWER",
      isActive: true,
    });

    console.log("Test REVIEWER created successfully.");
    console.log(`Email: ${email}`);
    console.log("Password: Test@12345");

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to create test reviewer:",
      error.message
    );

    process.exit(1);
  }
};

createTestReviewer();