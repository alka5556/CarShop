const express = require('express')
const router = express.Router()
const user = require('../controllers/user')
const {protect} = require('../middleware/authMiddleware')

router.post("/registration", user.registration)
router.post("/login", user.login)
router.post("/logout", user.logout)
router.post("/refresh", user.refresh)
router.get("/profile", protect, user.profile) //если роут возвразает личные данные то протект. по сути своей после палочки нужен инглиш чтобы экспресс не путался, например если будет два гета то запутается а так илет обозначение, но в нашем случае лучше оставить для понимания пути в URL 

module.exports = router