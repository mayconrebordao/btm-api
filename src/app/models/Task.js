const mongoose = require("../../database");

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    deadline: {
        type: Date,
        default: Date.now
    },
    private: {
        type: Boolean,
        default: false,
        require: true
    },
    belongs_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;