const Product = require('../models/Product');

// ─────────────────────────────────────────────
//  POST /api/products  — Create a new product
// ─────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products  — Get all products with filtering, sorting & pagination
// ─────────────────────────────────────────────────────────────────────────────
const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,        // "true" → only products with stock > 0
      search,         // name / description substring search
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────
//  GET /api/products/:id  — Get a single product
// ─────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
//  PUT /api/products/:id  — Update product details (not stock adjustment)
// ──────────────────────────────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    // Disallow direct stock update via this route (use /stock instead)
    const { stock, ...updateData } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────────────
//  PATCH /api/products/:id/stock  — Adjust stock (restock or sale)
//  Body: { type: "restock" | "sale", quantity: <number> }
// ────────────────────────────────────────────────────────────────────────────────
const adjustStock = async (req, res, next) => {
  try {
    const { type, quantity } = req.body;

    if (!type || !['restock', 'sale'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be either "restock" or "sale"',
      });
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity must be a positive number',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    if (type === 'sale') {
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${qty}`,
        });
      }
      product.stock -= qty;
    } else {
      product.stock += qty;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Stock ${type === 'restock' ? 'restocked' : 'sold'} successfully`,
      data: {
        productId: product._id,
        name: product.name,
        previousStock: type === 'restock' ? product.stock - qty : product.stock + qty,
        adjustment: type === 'restock' ? `+${qty}` : `-${qty}`,
        currentStock: product.stock,
        isLowStock: product.isLowStock,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────
//  DELETE /api/products/:id  — Delete a product
// ─────────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────
//  GET /api/products/reports/low-stock  — Low-stock alert report
//  Returns all products whose stock <= lowStockThreshold
// ─────────────────────────────────────────────────────────────────────
const getLowStockReport = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        },
      },
      {
        $project: {
          name: 1,
          sku: 1,
          category: 1,
          stock: 1,
          lowStockThreshold: 1,
          price: 1,
          supplier: 1,
          shortage: { $subtract: ['$lowStockThreshold', '$stock'] },
        },
      },
      { $sort: { stock: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      message: `${products.length} product(s) are low on stock`,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────────────────────────
//  GET /api/products/reports/category-summary  — Category-wise inventory summary
// ──────────────────────────────────────────────────────────────────────────────────
const getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalProducts: 1,
          totalStock: 1,
          totalValue: { $round: ['$totalValue', 2] },
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1,
          lowStockCount: 1,
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockReport,
  getCategorySummary,
};
