const User = require('../models/user.model');
const AppError = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');
const { generateToken } = require('../utils/generateToken.util');


const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({ email, isDeleted: false }).select('+password');
    if (!user || !(await user.isCorrectPassword(password))) {
        return next(new AppError('User is not found or incorrect password', 401));
    }
    if (user.status === 'blocked') {
        return next(new AppError('User is blocked', 403));
    }
    user.password = undefined;
    const acessToken = generateToken(user);
    res.status(200).json({ message: 'User logged in successfully', user: user, token: acessToken })
});

const signUp = catchAsync(async (req, res, next) => {
    const { name, email, password, gender, phone, age } = req.body;
    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email and password', 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('User already exists', 400));
    }
    const user = await User.create({ name, email, password, gender, phone, age });
    user.password = undefined;
    const acessToken = generateToken(user);
    res.status(201).json({ message: 'User signed up successfully', user: user, token: acessToken })
});

module.exports = { login, signUp };
