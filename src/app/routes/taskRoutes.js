const taskControl = require("../controllers/taskController");
const express = require("express");
const router = express.Router();

router.get("/:groupId/", taskControl.getAll);
router.get("/:groupId/:taskId", taskControl.getById);
router.post("/:groupId/", taskControl.create);
router.patch('/:groupId/:taskId', )
module.exports = app => app.use("/task", router);
