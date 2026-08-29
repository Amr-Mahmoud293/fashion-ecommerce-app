const { catchAsync } = require("../utils/catchAsync.util");

const paginate = (Model, filter = {}, populateOptions = null) => catchAsync(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || 'createdAt';
    const order = req.query.order === 'desc' ? -1 : 1;
    const queryFilter = { isDeleted: false, ...filter };
    let query = Model.find(queryFilter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);
    if (populateOptions) query = query.populate(populateOptions);
    const [results, total] = await Promise.all([
        query,
        Model.countDocuments(queryFilter)
    ])

    res.paginationResult =
    {
        results,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        total
    };
    next();
});

module.exports = { paginate };