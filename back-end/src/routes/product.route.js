const express = require("express");
const router = express.Router();
const Product = require("../models/product/product.model");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const { upload } = require("../middlewares/upload.middleware");
const {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    relatedProducts
} = require("../controllers/product.controller");
const { paginate } = require("../middlewares/paginate.middleware");
const { buildProductFilter } = require("../middlewares/productfilter.middleware");

router.get("/", buildProductFilter, paginate(Product, {}, [
    { path: "category", select: "name slug" },
    { path: "subCategory", select: "name slug" }
]), getAllProducts);

router.get("/related/:id", relatedProducts);
router.get("/:categorySlug/:productSlug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", authenticate, authorizeRole("admin"), upload.single("image"), createProduct);
router.put("/:id", authenticate, authorizeRole("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteProduct);

module.exports = router;