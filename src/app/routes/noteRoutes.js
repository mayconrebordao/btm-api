const noteControl = require("../controllers/noteController");
const groupMiddle = require('../middlewares/groupMiddleware')
const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth')
router.use(auth)



router.get('/:groupId/notes/', groupMiddle.groupExists, noteControl.getAll)
router.get('/:groupId/notes/:noteId', groupMiddle.groupExists, noteControl.getById)
router.post('/:groupId/notes/', groupMiddle.groupExists, noteControl.create)
router.patch('/:groupId/notes/:noteId', groupMiddle.groupExists, noteControl.update)
router.delete('/:groupId/notes/:noteId', groupMiddle.groupExists, noteControl.delete)

module.exports = app => app.use('/groups', router)