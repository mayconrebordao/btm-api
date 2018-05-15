const userControl = require("../controllers/userController");
const express = require("express");

const router = express.Router();
const auth = require("../middlewares/auth");
// router.use(auth);

// usando o middleware auth para verificar se o usuário esta registrado/logado na aplicação
router.get("/", auth, userControl.getAll);
router.get("/:userId", auth, userControl.getById);
router.post("/", userControl.create);
router.patch("/:userId", auth, userControl.update);
router.delete("/:userId", auth, userControl.delete);

module.exports = app => app.use("/users", router);

// => app.use("/authenticate", router);