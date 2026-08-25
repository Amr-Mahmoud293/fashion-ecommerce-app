// .env
const dotenv = require('dotenv');
dotenv.config();

// DB
const { connectDB } = require('./src/config/db.config');
connectDB();

const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.join(__dirname, 'uploads')));



app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("✅ Server running successfully!");
    console.log("=".repeat(60));
});


