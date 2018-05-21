const mongoose = require("../../database");

const GroupSchema = new mongoose.Schema({
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
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],
    notes: [{
        content: {
            type: String,
            require: true
        },
        userOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }]
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;