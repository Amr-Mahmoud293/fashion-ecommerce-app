const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./src/config/db.config');
const AppError = require('./src/utils/appError.util');
const globalError = require('./src/middlewares/errorHandelar.middleware');
const authRoutes = require('./src/routes/auth.route');
const userRoutes = require('./src/routes/user.route');
const productRoutes = require('./src/routes/product.route');
const categoryRoutes = require('./src/routes/category.route');
const subCategoryRoutes = require('./src/routes/subcategory.route');
const reviewRoutes = require('./src/routes/review.route')
const faqRoutes = require('./src/routes/faq.route');
const cartRoutes = require('./src/routes/cart.route');
const purchaseRoutes = require('./src/routes/purchase.route');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.join(__dirname, 'src/uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/subcategory', subCategoryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalError);

app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("✅ Server running successfully!");
    console.log("=".repeat(60));
});


