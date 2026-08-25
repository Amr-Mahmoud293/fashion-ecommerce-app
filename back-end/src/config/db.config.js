const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";
        console.log("Connecting to MongoDB");
        await mongoose.connect(mongoUri)
        console.log("✅ Mongo Connected successfully");
    } catch (error) {
        console.error("❌ Mongo connection error:", error);
        process.exit(1);
    }
}
module.exports = { connectDB };