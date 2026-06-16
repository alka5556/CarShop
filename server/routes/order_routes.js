const express = require('express')
const router = express.Router()
const order = require('../controllers/order')
const { protect, authorize } = require('../middleware/authMiddleware')

router.post('/', protect, order.createOrder)
router.get('/user-orders', protect, order.getMyOrders) //разделение идет для понимания. иначе оба гета пойдут в ордер и экспресс начнет путаться между юзером и админмо
router.get('/', protect, authorize('admin'), order.getAllOrders)
router.delete('/:id', protect, authorize('admin'), order.deleteOrder)

module.exports = router