const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockReport,
  getCategorySummary,
} = require('../controllers/productController');

// ── Report routes (must be defined before /:id to avoid route collision) ──
router.get('/reports/low-stock', getLowStockReport);
router.get('/reports/category-summary', getCategorySummary);

// ── Standard CRUD routes ──
router.route('/').get(getAllProducts).post(createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// ── Stock adjustment route ──
router.patch('/:id/stock', adjustStock);

module.exports = router;
