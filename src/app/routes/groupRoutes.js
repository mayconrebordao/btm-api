const express = require("express");
const router = express.Router();
const groupControl = require("../controllers/groupController");
const taskControl = require("../controllers/taskController");

// Rotas exclusivas dos grupos
router.get("/", groupControl.getAll);
router.get("/:groupId", groupControl.getById);
router.post("/", groupControl.create);
router.patch("/:groupId", groupControl.update);
router.delete("/:groupId", groupControl.delete);

// rotas de das tarefas dos grupos
router.get("/:groupId/task/", taskControl.getAll);
router.get("/:groupId/task/:taskId", taskControl.getById);
router.post("/:groupId/task/", taskControl.create);
router.patch("/:groupId/task/:taskId", )




module.exports = app => app.use("/groups", router);
