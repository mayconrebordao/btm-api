const express = require("express");
const router = express.Router();
const groupControl = require("../controllers/groupController");

router.get("/", groupControl.getAll);
router.get("/:groupId", groupControl.getById);
router.post("/", groupControl.create);
router.patch("/:groupId", groupControl.update);
router.delete("/:groupId", groupControl.delete);

module.exports = app => app.use("/groups", router);
