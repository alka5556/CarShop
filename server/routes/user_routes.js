const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const { protect } = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/refresh', userController.refresh)
router.get('/profile', protect, userController.profile) //если роут возвразает личные данные то протект. по сути своей после палочки нужен инглиш чтобы экспресс не путался, например если будет два гета то запутается а так илет обозначение, но в нашем случае лучше оставить для понимания пути в URL 
console.log('!!! МАРШРУТ /avatar ЗАРЕГИСТРИРОВАН !!!') 
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar)
router.post('/google-signin', userController.googleSignin);

module.exports = router