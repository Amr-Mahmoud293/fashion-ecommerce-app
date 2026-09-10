const buildProductFilter = (req, res, next) => {
    const filter = {};

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.subCategory) {
        filter.subCategory = req.query.subCategory;
    }

    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) {
            filter.price.$gte = Number(req.query.minPrice);
        }
        if (req.query.maxPrice) {
            filter.price.$lte = Number(req.query.maxPrice);
        }
    }

    if (req.query.isTop !== undefined) {
        filter.isTop = req.query.isTop === "true";
    }

    if (req.query.isNewArrival !== undefined) {
        filter.isNewArrival = req.query.isNewArrival === "true";
    }

    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: "i" };
    }

    req.productFilter = filter;
    next();
};

module.exports = { buildProductFilter };