const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },

    addresses: [{
        type: String,
        trim: true
    }],

    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    phone: {
        type: String,
        match: [/^[0-9]{11}$/, 'Invalid phone number']
    },
    age: {
        type: Number,
        min: [18, "Age must be at least 18"],
        max: [100, "Age must be at most 100"],
    },
    status: {
        type: String,
        default: 'active',
        enum: ['blocked', 'active'],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

},
    { timestamps: true }

);


userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
})

userSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("user", userSchema);

