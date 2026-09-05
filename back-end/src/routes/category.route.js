const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/category.controller");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", authenticate, authorizeRole("admin"), createCategory);
router.put("/:id", authenticate, authorizeRole("admin"), updateCategory);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteCategory);

module.exports = router;