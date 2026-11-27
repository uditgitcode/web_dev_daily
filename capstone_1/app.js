// app.js
// Entry point: sets up the Express server, middleware, and routes

const express = require("express");
const logger = require("./middleware/logger");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------
// Global Middleware
// ------------------------------------------------------------------
app.use(express.json()); // parse JSON request bodies
app.use(logger); // custom logger middleware (logs method, URL, time)

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Student Management REST API is running",
    endpoints: [
      "GET    /students",
      "GET    /students/:id",
      "POST   /students",
      "PUT    /students/:id",
      "DELETE /students/:id",
    ],
  });
});

app.use("/students", studentRoutes); // modular routing

// ------------------------------------------------------------------
// 404 Handler — for any route that doesn't exist
// ------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ------------------------------------------------------------------
// Global Error Handler — catches errors passed via next(err)
// ------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ------------------------------------------------------------------
// Start Server
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
