require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Connect to MongoDB ──
connectDB();

// ── Built-in Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check route ──
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Inventory & Data Management System API is running',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      lowStockReport: '/api/products/reports/low-stock',
      categorySummary: '/api/products/reports/category-summary',
    },
  });
});

// ── API Routes ──
app.use('/api/products', productRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Centralized Error Handler (must be last) ──
app.use(errorHandler);

// ── Start Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
