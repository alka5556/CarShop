const express = require('express')
const router = express.Router()
const cart = require('../controllers/cart')
const {protect} = require('../middleware/authMiddleware')

router.get('/', protect, cart.getCart)
router.post('/', protect, cart.addToCart)
router.delete('/:id', protect, cart.removeFromCart)

module.exports = router