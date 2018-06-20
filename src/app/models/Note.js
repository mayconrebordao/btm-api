const mongoose = require("../../database");

const NoteSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    belongs_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Note = mongoose.model("Note", NoteSchema);

module.exports = Note;