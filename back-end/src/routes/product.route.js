const express = require("express");
const router = express.Router();
const Product = require("../models/product/product.model");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const { upload } = require("../middlewares/upload.middleware");
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    relatedProducts
} = require("../controllers/product.controller");
const { paginate } = require("../middlewares/paginate.middleware");

router.get("/", paginate(Product, {}, [
    { path: "category", select: "name slug" },
    { path: "subCategory", select: "name slug" }
]), getAllProducts);

router.get("/related/:id", relatedProducts)
router.get("/:id", getProductById);
router.post("/", authenticate, authorizeRole("admin"), upload.single("image"), createProduct);
router.put("/:id", authenticate, authorizeRole("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteProduct);

module.exports = router;