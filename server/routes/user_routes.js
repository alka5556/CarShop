const express = require('express')
const router = express.Router()
const user = require('../controllers/user')

router.post("/registration", user.registration)
router.post("/login", user.login)


module.exports = router