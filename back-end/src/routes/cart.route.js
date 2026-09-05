const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const {
    getCart,
    syncCart,
    getGuestCart,
    acceptChange,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearCart
} = require("../controllers/cart.controller");

router.post("/guest", getGuestCart);
router.use(authenticate);
router.get("/", getCart);
router.post("/sync", syncCart);
router.post("/items", addItemToCart);
router.put("/items/:productId", updateCartItemQuantity);
router.delete("/items/:productId", removeItemFromCart);
router.put("/changes/:productId", acceptChange);
router.delete("/", clearCart);

module.exports = router;