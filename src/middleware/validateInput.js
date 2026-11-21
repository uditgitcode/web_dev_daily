/**
 * Input Validation Middleware
 *
 * Validates that incoming request bodies for product creation
 * contain the required fields before they reach the controller.
 */

const validateProductInput = (req, res, next) => {
  const { name, sku, category, price } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }
  if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
    errors.push('sku is required and must be a non-empty string');
  }
  if (!category || typeof category !== 'string') {
    errors.push('category is required');
  }
  if (price === undefined || price === null) {
    errors.push('price is required');
  } else if (isNaN(Number(price)) || Number(price) < 0) {
    errors.push('price must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = { validateProductInput };
