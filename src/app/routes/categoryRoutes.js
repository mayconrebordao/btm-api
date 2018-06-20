const express = require("express");
const categoryControl = require("../controllers/categoryController")
const groupMiddle = require('../middlewares/groupMiddleware')
const router = express.Router();
const auth = require('../middlewares/auth')
router.use(auth)



router.get('/:groupId/categories/', groupMiddle.groupExists, categoryControl.getAll)
router.get('/:groupId/categories/:categoryId', groupMiddle.groupExists, categoryControl.getById)
router.post('/:groupId/categories/', groupMiddle.groupExists, categoryControl.create)
router.patch('/:groupId/categories/:categoryId', groupMiddle.groupExists, categoryControl.update)
router.delete('/:groupId/categories/:categoryId', groupMiddle.groupExists, categoryControl.remove)

module.exports = app => app.use("/groups", router);