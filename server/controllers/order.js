const Order = require('../models/order')
const Car = require('../models/car')

// создать заказ
exports.createOrder = async (req, res, next) => {
    try {
        const car = await Car.findById(req.body.carId)
        if (!car) {
            return res.status(404).json({ message: 'Car not found' })
        }
        const order = new Order({
            carId: req.body.carId,
            userId: req.user.id,  // берём из токена
            amount: car.price 
        })
        const savedOrder = await order.save()
        res.status(201).json({success: true, order: savedOrder})
    } catch (error) {
        next(error)
    }
}

// мои заказы
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({userId: req.user.id}).populate("carId", "brand model year price")//популейт полные данные машины выодит пон. Ищем все заказы где userId совпадает с айди из токена то есть только МОИ заказы.
        res.status(200).json({success: true, orders}) //пользователь получает найденные заказы
    } catch (error) {
        next(error)
    }
}

// все заказы (админ)
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().
        populate('carId').
        populate('userId', '-refreshTokens -password') //в скобках пусто потому что без фильтров нам нужны все машины
        res.status(200).json({success: true, orders})
    } catch (error) {
        next(error)
    }
}

// удалить заказ
exports.deleteOrder = async (req, res, next) => {
    try {
        await Order.findByIdAndDelete(req.params.id)// берет айди самого заказа который создал монгодб автоматом
        res.status(200).json({success: true, message: 'Order deleted'})
    } catch (error) {
        next(error)
    }
}