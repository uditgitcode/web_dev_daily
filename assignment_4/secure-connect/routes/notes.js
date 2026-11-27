const express = require("express");
const { notes } = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const appEvents = require("../events/appEvents");

const router = express.Router();

// Every notes route needs a valid JWT
router.use(verifyToken);

// Find a note the current user is allowed to touch (owner, or admin)
function findAccessibleNote(req) {
  const note = notes.findOne({ _id: req.params.id });
  if (!note) return { status: 404, message: "Note not found" };
  if (note.owner !== req.user.id && req.user.role !== "admin") {
    return { status: 403, message: "You can only access your own notes" };
  }
  return { note };
}

// GET /api/notes - list my notes
router.get("/", (req, res) => {
  res.json(notes.find({ owner: req.user.id }));
});

// GET /api/notes/:id - single note
router.get("/:id", (req, res) => {
  const { note, status, message } = findAccessibleNote(req);
  if (!note) return res.status(status).json({ message });
  res.json(note);
});

// POST /api/notes - create note
router.post("/", (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ message: "title and content are required" });
  }
  const note = notes.insert({ title: title.trim(), content, owner: req.user.id });
  appEvents.emit("note:created", note);
  res.status(201).json(note);
});

// PUT /api/notes/:id - update note
router.put("/:id", (req, res) => {
  const { note, status, message } = findAccessibleNote(req);
  if (!note) return res.status(status).json({ message });

  const { title, content } = req.body || {};
  if (!title && !content) {
    return res.status(400).json({ message: "Provide title or content to update" });
  }
  const changes = {};
  if (title) changes.title = title.trim();
  if (content) changes.content = content;

  const updated = notes.update({ _id: note._id }, changes);
  appEvents.emit("note:updated", updated);
  res.json(updated);
});

// DELETE /api/notes/:id - delete note
router.delete("/:id", (req, res) => {
  const { note, status, message } = findAccessibleNote(req);
  if (!note) return res.status(status).json({ message });

  notes.remove({ _id: note._id });
  appEvents.emit("note:deleted", note);
  res.json({ message: "Note deleted", id: note._id });
});

module.exports = router;
