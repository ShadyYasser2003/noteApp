const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Redis = require("ioredis");  // Import Redis

// Redis connection setup
const redis = new Redis({
  host: process.env.REDIS_URL || 'redis-service',
  port: 6379,
});

// Register User
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    age,
    gender,
  } = req.body;

  try {
    // Check if user already exists in Redis
    const existingUser = await redis.get(`user:${email}`);
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in Redis
    const user = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      age,
      gender,
    };

    await redis.set(`user:${email}`, JSON.stringify(user));

    // Generate JWT token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await redis.get(`user:${email}`);
    if (!user) return res.status(400).json({ message: "User not found" });

    const parsedUser = JSON.parse(user);
    const isMatch = await bcrypt.compare(password, parsedUser.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
