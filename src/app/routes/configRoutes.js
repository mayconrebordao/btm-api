const express = require('express')
const router = express.Router()
const authenticate = require('../controllers/authController')

router.post('/authenticate', authenticate.register)


module.exports = app => app.use('/', router)