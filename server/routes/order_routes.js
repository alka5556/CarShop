const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order')
const { protect, authorize } = require('../middleware/authMiddleware')

router.post('/', protect, orderController.createOrder)
router.get('/user-orders', protect, orderController.getMyOrders) //разделение идет для понимания. иначе оба гета пойдут в ордер и экспресс начнет путаться между юзером и админмо
router.get('/', protect, authorize('admin'), orderController.getAllOrders)
router.delete('/:id', protect, authorize('admin'), orderController.deleteOrder)

module.exports = router