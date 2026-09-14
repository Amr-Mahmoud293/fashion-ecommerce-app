const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const {
    getShippingOptions,
    createShippingOption,
    updateShippingOption,
    deleteShippingOption
} = require("../controllers/shipping.controller");

router.get("/", getShippingOptions);
router.post("/", authenticate, authorizeRole("admin"), createShippingOption);
router.put("/:id", authenticate, authorizeRole("admin"), updateShippingOption);
router.delete("/:id", authenticate, authorizeRole("admin"), deleteShippingOption);

module.exports = router;

