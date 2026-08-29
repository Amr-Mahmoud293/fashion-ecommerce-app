const express = require("express");
const router = express.Router();
const Review = require("../models/review.model");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const {
    getMyReview, getActiveReviews, createMyReview, updateMyReview, deleteMyReview,
    getAllReviews, getReviewById, updateReviewByAdmin, deleteReviewByAdmin
} = require("../controllers/review.controller");
const { paginate } = require("../middlewares/paginate.middleware");

router.get("/active", paginate(Review, { isApproved: true }, { path: "user", select: "name" }), getActiveReviews);
router.get("/my-review", authenticate, getMyReview);
router.post("/my-review", authenticate, createMyReview);
router.put("/my-review", authenticate, updateMyReview);
router.delete("/my-review", authenticate, deleteMyReview);

router.get("/", authenticate, authorizeRole("admin"), paginate(Review, {}, { path: "user", select: "name email" }), getAllReviews);
router.get("/:id", getReviewById);
router.put("/:id", authenticate, authorizeRole("admin"), updateReviewByAdmin);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteReviewByAdmin);

module.exports = router;