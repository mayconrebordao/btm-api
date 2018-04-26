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
  category: {
    type: String,
    require: true
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
