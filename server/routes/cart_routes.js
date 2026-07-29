const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cart')
const {protect} = require('../middleware/authMiddleware')

router.get('/', protect, cartController.getCart)
router.post('/', protect, cartController.addToCart)
router.delete('/:id', protect, cartController.removeFromCart)

module.exports = router