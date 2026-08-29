const mongoose = require("mongoose");


const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        trim: true,
        required: [true, "Question is required"],
        minlength: [5, "Question must be at least 5 characters long"],
        maxlength: [300, "Question must be at most 300 characters long"]
    },
    answer: {
        type: String,
        trim: true,
        required: [true, "Answer is required"],
        minlength: [10, "Answer must be at least 10 characters long"],
        maxlength: [1000, "Answer must be at most 1000 characters long"]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);


module.exports = mongoose.model("faq", faqSchema);
