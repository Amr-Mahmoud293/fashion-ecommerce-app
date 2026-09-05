const Cart = require("../models/cart.model");
const Product = require("../models/product/product.model");
const { catchAsync } = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

const STOCK_SAFETY_BUFFER = 3;
const POPULATE_PRODUCT_FIELDS = "name price imageURL isActive isDeleted stock";

const calculateCartTotal = (items) => {
    const total = items.reduce((sum, item) => {
        const price = Number(item.priceAtAddition) || 0;
        const qty = Number(item.quantity) || 0;
        return sum + (price * qty);
    }, 0);
    return total;
};

const validateCartState = (cart) => {
    let hasChanges = false;
    const validItems = [];
    const newChangedItems = [];
    const failedItems = [];

    cart.items.forEach((item) => {
        const product = item.product;
        if (!product || product.isDeleted || !product.isActive || product.stock <= STOCK_SAFETY_BUFFER) {
            hasChanges = true;
            failedItems.push({ product, reason: "Product is currently unavailable" });
            return;
        }
        const requestedQuantity = Math.max(1, Number(item.quantity) || 1);
        const maxAllowedQuantity = Math.max(1, product.stock - STOCK_SAFETY_BUFFER);
        const oldPrice = Number(item.priceAtAddition) || 0;
        const currentPrice = product.price;
        const priceChanged = oldPrice !== currentPrice;
        const quantityChanged = requestedQuantity > maxAllowedQuantity;
        const finalQuantity = quantityChanged ? maxAllowedQuantity : requestedQuantity;
        if (priceChanged || quantityChanged) {
            hasChanges = true;
            newChangedItems.push({
                product,
                oldPrice,
                newPrice: currentPrice,
                oldQuantity: requestedQuantity,
                newQuantity: finalQuantity,
                priceChanged,
                quantityChanged
            });
        } else {
            validItems.push({
                product: product,
                quantity: finalQuantity,
                priceAtAddition: currentPrice
            });
        }
    });

    cart.changedItems.forEach((chItem) => {
        const product = chItem.product;
        if (!product || product.isDeleted || !product.isActive || product.stock <= STOCK_SAFETY_BUFFER) {
            hasChanges = true;
            failedItems.push({ product, reason: "Product is currently unavailable" });
            return;
        }
        const availableStock = product.stock - STOCK_SAFETY_BUFFER;
        const maxQty = availableStock;
        const isQuantityChanged = chItem.oldQuantity > maxQty;
        const isPriceChanged = chItem.oldPrice !== product.price;
        const currentQuantity = isQuantityChanged ? maxQty : chItem.oldQuantity;
        if (!isQuantityChanged && !isPriceChanged) {
            hasChanges = true;
            validItems.push({
                product: product,
                quantity: chItem.oldQuantity,
                priceAtAddition: product.price
            });
        } else {
            newChangedItems.push({
                product,
                oldPrice: chItem.oldPrice,
                newPrice: product.price,
                oldQuantity: chItem.oldQuantity,
                newQuantity: currentQuantity,
                priceChanged: isPriceChanged,
                quantityChanged: isQuantityChanged
            });
        }
    });
    cart.items = validItems;
    cart.changedItems = newChangedItems;
    cart.totalCartPrice = calculateCartTotal(cart.items);
    return {
        cart,
        hasChanges,
        failedItems,
    };
};

const getCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user._id })
        .populate("items.product", POPULATE_PRODUCT_FIELDS)
        .populate("changedItems.product", POPULATE_PRODUCT_FIELDS);
    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
            changedItems: [],
            totalCartPrice: 0
        });
    }
    const validated = validateCartState(cart);
    if (validated.hasChanges) {
        await validated.cart.save();
    }
    res.status(200).json({
        message: validated.hasChanges
            ? "Cart updated due to stock or price changes"
            : "Cart retrieved successfully",
        hasChanges: validated.hasChanges,
        failedItems: validated.failedItems,
        data: validated.cart
    });
});

const syncCart = catchAsync(async (req, res, next) => {
    const { localItems } = req.body;
    if (localItems.length === 0) {
        return next(new AppError("No items provided to sync", 400));
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [], changedItems: [], totalCartPrice: 0 });
    }
    const localProductIds = localItems.map((item) => item.productId);
    const existingCartProductIds = cart.items.map(item => item.product.toString());
    const allProductIds = [...new Set([...localProductIds, ...existingCartProductIds])];
    const dbProducts = await Product.find({ _id: { $in: allProductIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));
    const notFoundItems = [];
    localItems.forEach((localItem) => {
        const product = productMap.get(localItem.productId?.toString());
        if (!product) {
            notFoundItems.push({
                product: null,
                reason: "Product is no longer available in store"
            });
            return;
        }
        const qty = Math.max(1, Number(localItem.quantity));
        const existingIndex = cart.items.findIndex(
            (item) => item.product.toString() === product._id.toString()
        );
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += qty;
        } else {
            cart.items.push({
                product: product._id,
                quantity: qty,
                priceAtAddition: localItem.price
            });
        }
    });

    cart.totalCartPrice = calculateCartTotal(cart.items);
    await cart.save();
    cart = await Cart.findById(cart._id)
        .populate("items.product", POPULATE_PRODUCT_FIELDS)
        .populate("changedItems.product", POPULATE_PRODUCT_FIELDS);
    const validated = validateCartState(cart);
    if (validated.hasChanges) {
        await validated.cart.save();
        await validated.cart.populate([
            { path: "items.product", select: POPULATE_PRODUCT_FIELDS },
            { path: "changedItems.product", select: POPULATE_PRODUCT_FIELDS }
        ]);
    }
    res.status(200).json({
        message: "Cart synced and updated successfully",
        hasChanges: validated.hasChanges || notFoundItems.length > 0,
        failedItems: {
            unavailable: validated.failedItems,
            notFound: notFoundItems
        },
        data: validated.cart
    });
});

const getGuestCart = catchAsync(async (req, res, next) => {
    const { localItems } = req.body;
    if (localItems.length === 0) {
        return next(new AppError("No items to validate", 400));
    }
    const productIds = localItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const itemsToValidate = localItems.map((localItem) => ({
        product: productMap.get(localItem.productId?.toString()),
        quantity: localItem.quantity,
        priceAtAddition: localItem.price
    }));
    const virtualCart = {
        items: itemsToValidate,
        changedItems: []
    };
    const validated = validateCartState(virtualCart);
    res.status(200).json({
        message: validated.hasChanges
            ? "Cart validated with changes"
            : "Cart validated successfully",
        failedItems: validated.failedItems,
        hasChanges: validated.hasChanges,
        data: validated.cart,
    });
});

const acceptChange = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }
    const changedIndex = cart.changedItems.findIndex(
        (item) => item.product.toString() === productId
    );
    if (changedIndex === -1) {
        return next(new AppError("Product not found in pending changes", 404));
    }
    const changedItem = cart.changedItems[changedIndex];
    const product = await Product.findOne({
        _id: productId,
        isDeleted: false,
        isActive: true
    });
    if (!product || product.stock <= STOCK_SAFETY_BUFFER) {
        cart.changedItems.splice(changedIndex, 1);
        await cart.save();
        return next(new AppError("Product is no longer available or out of stock", 400));
    }
    const maxQty = product.stock - STOCK_SAFETY_BUFFER;
    const finalQty = Math.min(changedItem.newQuantity, maxQty);
    const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );
    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = finalQty;
        cart.items[existingItemIndex].priceAtAddition = product.price;
    } else {
        cart.items.push({
            product: product._id,
            quantity: finalQty,
            priceAtAddition: product.price
        });
    }
    cart.changedItems.splice(changedIndex, 1);
    cart.totalCartPrice = calculateCartTotal(cart.items);
    await cart.save();
    await cart.populate([
        { path: "items.product", select: POPULATE_PRODUCT_FIELDS },
        { path: "changedItems.product", select: POPULATE_PRODUCT_FIELDS }
    ]);
    res.status(200).json({
        message: "Change accepted successfully",
        hasChanges: false, 
        failedItems: [],
        data: cart
    });
});

const addItemToCart = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const requestedQuantity = Number(req.body.quantity);
    if (!requestedQuantity || requestedQuantity < 1) {
        return next(new AppError("Quantity must be at least 1", 400));
    }

    if (!productId) {
        return next(new AppError("Product ID is required", 400));
    }
    const product = await Product.findOne({
        _id: productId,
        isDeleted: false,
        isActive: true,
        stock: { $gt: STOCK_SAFETY_BUFFER }
    });
    if (!product) {
        return next(new AppError("Product is no longer available or out of stock", 400));
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [], changedItems: [], totalCartPrice: 0 });
    }
    const maxAllowedQuantity = product.stock - STOCK_SAFETY_BUFFER;
    const cartItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (cartItemIndex > -1) {
        const newQuantity = cart.items[cartItemIndex].quantity + requestedQuantity;
        if (newQuantity > maxAllowedQuantity) {
            return next(
                new AppError(
                    `Cannot add requested quantity. Only ${maxAllowedQuantity} available, and you have ${cart.items[cartItemIndex].quantity} in cart.`,
                    400
                )
            );
        }
        cart.items[cartItemIndex].quantity = newQuantity;
        cart.items[cartItemIndex].priceAtAddition = product.price;
    } else {
        if (requestedQuantity > maxAllowedQuantity) {
            return next(new AppError(`Only ${maxAllowedQuantity} items available in stock.`, 400));
        }
        cart.items.push({
            product: productId,
            quantity: requestedQuantity,
            priceAtAddition: product.price
        });
    }
    cart.changedItems = cart.changedItems.filter((item) => item.product.toString() !== productId);
    cart.totalCartPrice = calculateCartTotal(cart.items);
    await cart.save();
    await cart.populate([
        { path: "items.product", select: POPULATE_PRODUCT_FIELDS },
        { path: "changedItems.product", select: POPULATE_PRODUCT_FIELDS }
    ]);
    res.status(200).json({
        message: "Item added to cart successfully",
        data: cart
    });
});

const updateCartItemQuantity = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) {
        return next(new AppError("Quantity must be at least 1", 400));
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
        const changedIndex = cart.changedItems.findIndex((item) => item.product.toString() === productId);
        if (changedIndex === -1) {
            return next(new AppError("Item not found in cart", 404));
        }
        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
            isActive: true
        });
        if (!product || product.stock <= STOCK_SAFETY_BUFFER) {
            return next(new AppError("Product is currently unavailable or out of stock", 400));
        }
        const maxAllowedQuantity = product.stock - STOCK_SAFETY_BUFFER;
        if (quantity > maxAllowedQuantity) {
            return next(new AppError(`Only ${maxAllowedQuantity} items available in stock`, 400));
        }
        cart.changedItems[changedIndex].oldQuantity = quantity;
        cart.changedItems[changedIndex].newQuantity = quantity;
        cart.changedItems[changedIndex].quantityChanged = false;
        await cart.save();
        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product", POPULATE_PRODUCT_FIELDS)
            .populate("changedItems.product", POPULATE_PRODUCT_FIELDS);
        return res.status(200).json({
            message: "Pending change quantity updated. Accept the change to apply it to your cart.",
            data: populatedCart
        });
    }
    const product = await Product.findOne({
        _id: productId,
        isDeleted: false,
        isActive: true
    });
    if (!product || product.stock <= STOCK_SAFETY_BUFFER) {
        return next(new AppError("Product is currently unavailable or out of stock", 400));
    }
    const maxAllowedQuantity = product.stock - STOCK_SAFETY_BUFFER;
    if (quantity > maxAllowedQuantity) {
        return next(new AppError(`Only ${maxAllowedQuantity} items available in stock`, 400));
    }
    const existingItem = cart.items[itemIndex];
    const priceChanged = product.price !== existingItem.priceAtAddition;
    if (priceChanged) {
        cart.changedItems.push({
            product: product._id,
            oldPrice: existingItem.priceAtAddition,
            newPrice: product.price,
            oldQuantity: quantity,
            newQuantity: quantity,
            priceChanged: true,
            quantityChanged: false
        });
        cart.items.splice(itemIndex, 1);
        cart.totalCartPrice = calculateCartTotal(cart.items);
        await cart.save();
        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product", POPULATE_PRODUCT_FIELDS)
            .populate("changedItems.product", POPULATE_PRODUCT_FIELDS);
        return res.status(200).json({
            message: "Price for this item has changed. Please review and confirm the new quantity.",
            data: populatedCart
        });
    }
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceAtAddition = product.price;
    cart.totalCartPrice = calculateCartTotal(cart.items);
    await cart.save();
    await cart.populate([
        { path: "items.product", select: POPULATE_PRODUCT_FIELDS },
        { path: "changedItems.product", select: POPULATE_PRODUCT_FIELDS }
    ]);
    res.status(200).json({
        message: "Cart item updated successfully",
        data: cart
    });
});

const removeItemFromCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    const changedIndex = cart.changedItems.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1 && changedIndex === -1) {
        return next(new AppError("Item not found in cart", 404));
    }
    if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
    }
    if (changedIndex > -1) {
        cart.changedItems.splice(changedIndex, 1);
    }
    cart.totalCartPrice = calculateCartTotal(cart.items);
    await cart.save();
    await cart.populate([
        { path: "items.product", select: POPULATE_PRODUCT_FIELDS },
        { path: "changedItems.product", select: POPULATE_PRODUCT_FIELDS }
    ]);
    res.status(200).json({
        message: "Item removed from cart successfully",
        data: cart
    });
});

const clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }
    cart.items = [];
    cart.changedItems = [];
    cart.totalCartPrice = 0;
    await cart.save();
    res.status(200).json({
        message: "Cart cleared successfully",
        hasChanges: false,
        failedItems: [],
        data: cart
    });
});

module.exports = {
    getCart,
    syncCart,
    getGuestCart,
    acceptChange,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearCart
};