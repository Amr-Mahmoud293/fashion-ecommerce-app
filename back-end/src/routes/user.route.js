const express = require("express");
const router = express.Router();
const User = require("../models/user.model.js");
const { paginate } = require("../middlewares/paginate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const {
    getMyProfile, updateMyProfile, deleteMyProfile,
    getAllUsers, getUserById, updateUserByAdmin, deleteUserByAdmin } = require("../controllers/user.controller");

router.get("/my-profile", authenticate, getMyProfile);
router.put("/my-profile", authenticate, updateMyProfile);
router.delete("/my-profile", authenticate, deleteMyProfile);

router.get("/", authenticate, authorizeRole("admin"), paginate(User), getAllUsers);
router.get("/:id", authenticate, authorizeRole("admin"), getUserById);
router.put("/:id", authenticate, authorizeRole("admin"), updateUserByAdmin);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteUserByAdmin);

module.exports = router;