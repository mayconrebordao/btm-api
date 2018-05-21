const taskControl = require("../controllers/taskController");
const categoryMiddle = require('../middlewares/categoryMiddleware')
const groupMiddle = require('../middlewares/groupMiddleware')
const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth')
router.use(auth)

router.get("/:groupId/categories/:categoryId/tasks/", groupMiddle.groupExists, categoryMiddle.categoryExists, taskControl.getAll);
router.get("/:groupId/categories/:categoryId/tasks/:taskId", groupMiddle.groupExists, categoryMiddle.categoryExists, taskControl.getById);
router.post("/:groupId/categories/:categoryId/tasks/", groupMiddle.groupExists, categoryMiddle.categoryExists, taskControl.create);
router.patch("/:groupId/categories/:categoryId/tasks/:taskId", groupMiddle.groupExists, categoryMiddle.categoryExists, taskControl.update);
router.delete("/:groupId/categories/:categoryId/tasks/:taskId", groupMiddle.groupExists, categoryMiddle.categoryExists, taskControl.remove);
// module.exports = app => app.use("/task", router);

module.exports = app => app.use("/groups/", router);