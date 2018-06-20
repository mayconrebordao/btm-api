const express = require('express')
const router = express.Router()
const authenticate = require('../controllers/authController')
const userControl = require('../controllers/userController')

router.post('/authenticate', authenticate.register)
router.post('/register', userControl.create)


module.exports = app => app.use('/', router)