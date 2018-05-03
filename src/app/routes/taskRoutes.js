const taskControl = require("../controllers/taskController");
const express = require("express");
const router = express.Router();

router.get("/", taskControl.getAll);
router.get("/:taskId", taskControl.getById);
router.post("/", taskControl.create);

module.exports = app => app.use("/task", router);
