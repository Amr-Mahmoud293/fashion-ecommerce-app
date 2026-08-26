const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./src/config/db.config');
const AppError = require('./src/utils/appError.util');
const globalError = require('./src/middlewares/errorHandelar.middleware');
const authRoutes = require('./src/routes/auth.route');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalError);

app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("✅ Server running successfully!");
    console.log("=".repeat(60));
});


