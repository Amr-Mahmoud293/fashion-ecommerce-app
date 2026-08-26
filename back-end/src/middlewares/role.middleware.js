const AppError = require('../utils/appError.util');
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return next(new AppError('you are not authorized', 401))
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new AppError('you do not have permission to access this resource', 403))
        }
        next();
    }
}
module.exports = { authorizeRole };