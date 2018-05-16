const taskControl = require("../controllers/taskController");
const groupMiddle = require('../middlewares/groupMiddleware')
const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth')
router.use(auth)

router.get("/:groupId/tasks/", groupMiddle.groupExists, taskControl.getAll);
router.get("/:groupId/tasks/:taskId", groupMiddle.groupExists, taskControl.getById);
router.post("/:groupId/tasks/", groupMiddle.groupExists, taskControl.create);
router.patch("/:groupId/tasks/:taskId", groupMiddle.groupExists, taskControl.update);
router.delete("/:groupId/tasks/:taskId", groupMiddle.groupExists, taskControl.remove);
// module.exports = app => app.use("/task", router);

module.exports = app => app.use("/groups", router);