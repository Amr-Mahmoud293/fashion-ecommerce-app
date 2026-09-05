const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchase.model");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const { paginate } = require("../middlewares/paginate.middleware");
const {
    createPurchase,
    getMyPurchases,
    getPurchaseById,
    cancelPurchase,
    getAllOrders,
    changeOrderStatus
} = require("../controllers/purchase.controller");

router.use(authenticate);
router.get("/my-purchases", getMyPurchases);
router.get("/my-purchases/:id", getPurchaseById);
router.post("/my-purchases", createPurchase);
router.put("/my-purchases/:id", cancelPurchase);

router.get("/", authorizeRole("admin"), paginate(Purchase, {}, [
    { path: "user", select: "name email" },
    { path: "products.product", select: "name price imageURL" }
]), getAllOrders);
router.put("/:id", authorizeRole("admin"), changeOrderStatus);


module.exports = router;
