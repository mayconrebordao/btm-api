const mongoose = require("../../database");

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ]
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
