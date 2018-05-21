const mongoose = require("../../database");

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    belongs_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }]
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;