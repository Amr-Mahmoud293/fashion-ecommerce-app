const express = require("express");
const router = express.Router();
const FAQ = require("../models/faq.model");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const { getFaqById, getAllFaqs, createFaq, updateFaq, deleteFaq } = require("../controllers/faq.controller");
const { paginate } = require("../middlewares/paginate.middleware");

router.get("/", paginate(FAQ), getAllFaqs);
router.get("/:id", getFaqById);
router.post("/", authenticate, authorizeRole("admin"), createFaq);
router.put("/:id", authenticate, authorizeRole("admin"), updateFaq);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteFaq);

module.exports = router;