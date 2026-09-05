const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const {
    getAllSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
} = require("../controllers/subcategory.controller");

router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.post("/", authenticate, authorizeRole("admin"), createSubCategory);
router.put("/:id", authenticate, authorizeRole("admin"), updateSubCategory);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteSubCategory);

module.exports = router;