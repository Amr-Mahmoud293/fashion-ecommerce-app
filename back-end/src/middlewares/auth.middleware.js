const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util')


const authenticate = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer')) {
        return next(new AppError('you are not authorized', 401))
    }
    const token = authHeader.split(' ')[1];
    const verfiyToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: verfiyToken.id, isDeleted: false }).select('-password');
    if (!user) {
        return next(new AppError('invalid token', 401))
    }
    if (user.status === 'blocked') {
        return next(new AppError('You are blocked', 403));
    }
    req.user = user;
    next();

});


module.exports = { authenticate }
