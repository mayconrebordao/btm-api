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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "note"
    }]
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;