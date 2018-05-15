const express = require("express");
const router = express.Router();
const groupControl = require("../controllers/groupController");
const taskControl = require("../controllers/taskController");
const auth = require('../middlewares/auth')

router.use(auth)

// Rotas exclusivas dos grupos
router.get("/", groupControl.getAll);
router.get("/:groupId", groupControl.getById);
router.post("/", groupControl.create);
router.patch("/:groupId", groupControl.update);
router.delete("/:groupId", groupControl.delete);

// rotas de das tarefas dos grupos
router.get("/:groupId/tasks/", taskControl.getAll);
router.get("/:groupId/tasks/:taskId", taskControl.getById);
router.post("/:groupId/tasks/", taskControl.create);
router.patch("/:groupId/tasks/:taskId", taskControl.update);




module.exports = app => app.use("/groups", router);