require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");  // Import Redis library
const app = express();
const port = 3000;

// Enable CORS
app.use(cors());
// Enable JSON parser
app.use(express.json());

// Redis connection setup using environment variables
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis-service',  // Redis service hostname
  port: process.env.REDIS_PORT || 6379,  // Default Redis port
});

// Route the Note API
const noteRoutes = require("./routes/note");
app.use("/api/notes", noteRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to API");
});

// Start server
app.listen(port, (err) => {
  if (!err) {
    console.log("Server is successfully listening on port : ", port);
  } else {
    console.error("Error starting the server:", err);
  }
});

// Handle Note operations with Redis

// POST: Add a note to Redis
app.post("/api/notes", async (req, res) => {
  const { noteId, noteContent } = req.body;
  try {
    // Save note in Redis with noteId as key
    await redis.set(`note:${noteId}`, JSON.stringify(noteContent));  
    res.status(201).send({ message: "Note saved successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to save note" });
  }
});

// GET: Retrieve a note from Redis
app.get("/api/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  try {
    // Fetch note from Redis
    const note = await redis.get(`note:${noteId}`);
    if (note) {
      res.status(200).send(JSON.parse(note));  // Return note if found
    } else {
      res.status(404).send({ error: "Note not found" });
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch note" });
  }
});

// PUT: Update a note in Redis
app.put("/api/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { noteContent } = req.body;
  try {
    // Update note in Redis
    await redis.set(`note:${noteId}`, JSON.stringify(noteContent));
    res.status(200).send({ message: "Note updated successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to update note" });
  }
});

// DELETE: Delete a note from Redis
app.delete("/api/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  try {
    // Delete note from Redis
    await redis.del(`note:${noteId}`);
    res.status(200).send({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to delete note" });
  }
});

// Auth Routes (You may want to replace with Redis session handling if needed)
// POST: Register (Example)
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Save user in Redis (For demonstration, simple key-value store)
    const userId = `user:${username}`;
    await redis.set(userId, JSON.stringify({ username, password }));
    res.status(201).send({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to register user" });
  }
});

// POST: Login (Example)
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userId = `user:${username}`;
    const user = await redis.get(userId);
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.password === password) {
        res.status(200).send({ message: "Login successful" });
      } else {
        res.status(400).send({ error: "Invalid credentials" });
      }
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to login user" });
  }
});
