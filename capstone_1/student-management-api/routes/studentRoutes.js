// routes/studentRoutes.js
// Modular routing for all /students endpoints (CRUD)

const express = require("express");
const router = express.Router();
const { students, getNextId } = require("../data/students");

// ------------------------------------------------------------------
// GET /students  -> get all students
// ------------------------------------------------------------------
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// ------------------------------------------------------------------
// GET /students/:id  -> get a single student by id
// ------------------------------------------------------------------
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid student id" });
  }

  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ success: false, message: `Student with id ${id} not found` });
  }

  res.status(200).json({ success: true, data: student });
});

// ------------------------------------------------------------------
// POST /students  -> create a new student
// ------------------------------------------------------------------
router.post("/", (req, res) => {
  const { name, course, age } = req.body || {};

  // Basic validation
  if (!name || !course) {
    return res.status(400).json({
      success: false,
      message: "Both 'name' and 'course' are required fields",
    });
  }

  const newStudent = {
    id: getNextId(),
    name,
    course,
    age: age !== undefined ? age : null,
  };

  students.push(newStudent);

  res.status(201).json({ success: true, data: newStudent });
});

// ------------------------------------------------------------------
// PUT /students/:id  -> update an existing student
// ------------------------------------------------------------------
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid student id" });
  }

  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ success: false, message: `Student with id ${id} not found` });
  }

  const { name, course, age } = req.body || {};

  if (!name && !course && age === undefined) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update: 'name', 'course', or 'age'",
    });
  }

  if (name) student.name = name;
  if (course) student.course = course;
  if (age !== undefined) student.age = age;

  res.status(200).json({ success: true, data: student });
});

// ------------------------------------------------------------------
// DELETE /students/:id  -> remove a student
// ------------------------------------------------------------------
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid student id" });
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Student with id ${id} not found` });
  }

  const deleted = students.splice(index, 1);

  res.status(200).json({ success: true, message: "Student deleted", data: deleted[0] });
});

module.exports = router;
