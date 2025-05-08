const express = require("express");
const router = express.Router();
const Redis = require("ioredis");  // Import Redis

// Redis connection setup
const redis = new Redis({
  host: process.env.REDIS_URL || 'redis-service',
  port: 6379,
});

const authMiddleware = require("../middlewares/authMiddleware");

// Get My Notes
router.get("/my-notes", authMiddleware, async (req, res) => {
  try {
    const notes = [];
    const userNotesKeys = await redis.keys(`note:${req.user.email}:*`);  // Get keys for this user's notes
    for (let key of userNotesKeys) {
      const note = await redis.get(key);
      notes.push(JSON.parse(note));
    }
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Notes
router.get("/", async (req, res) => {
  try {
    const notes = [];
    const allNotesKeys = await redis.keys("note:*");  // Get all note keys
    for (let key of allNotesKeys) {
      const note = await redis.get(key);
      notes.push(JSON.parse(note));
    }
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err });
  }
});

// Create Note
router.post("/", async (req, res) => {
  try {
    const { noteId, title, content } = req.body;
    const userEmail = req.user.email;
    const note = { noteId, title, content, userEmail };
    const noteKey = `note:${userEmail}:${noteId}`;

    await redis.set(noteKey, JSON.stringify(note));
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err });
  }
});

// Update Note
router.put("/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;
  const userEmail = req.user.email;
  
  try {
    const noteKey = `note:${userEmail}:${noteId}`;
    const note = await redis.get(noteKey);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const updatedNote = { noteId, title, content, userEmail };
    await redis.set(noteKey, JSON.stringify(updatedNote));
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err });
  }
});

// Delete Note
router.delete("/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const userEmail = req.user.email;

  try {
    const noteKey = `note:${userEmail}:${noteId}`;
    const deletedNote = await redis.del(noteKey);

    if (deletedNote === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err });
  }
});

// Search Notes
router.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const notes = [];
    const allNotesKeys = await redis.keys("note:*");

    for (let key of allNotesKeys) {
      const note = await redis.get(key);
      const parsedNote = JSON.parse(note);

      if (parsedNote.title.includes(query) || parsedNote.content.includes(query)) {
        notes.push(parsedNote);
      }
    }

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
