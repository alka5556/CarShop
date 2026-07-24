const Cart = require('../models/cart')

// получить корзину текущего юзера
exports.getCart = async (req, res, next) => {
    try {
        const cartItems = await Cart.find({ userId: req.user.id }).populate('carId')
        res.status(200).json({ success: true, cartItems })
    } catch (error) {
        next(error)
    }
}

// добавить машину в корзину
exports.addToCart = async (req, res, next) => {
    try {
        const { carId, quantity } = req.body

        // если эта машина уже в корзине у юзера - просто увеличиваем quantity
        let item = await Cart.findOne({ userId: req.user.id, carId })

        if (item) {
            item.quantity += quantity || 1
            await item.save()
        } else {
            item = new Cart({
                userId: req.user.id,
                carId,
                quantity: quantity || 1
            })
            await item.save()
        }

        res.status(201).json({ success: true, item })
    } catch (error) {
        next(error)
    }
}

// удалить машину из корзины
exports.removeFromCart = async (req, res, next) => {
    try {
        const { id } = req.params
        const deleted = await Cart.findOneAndDelete({ _id: id, userId: req.user.id }) //найти и удалить одну запись которая соотвествует этим двум условиям
//монгодб по сути своей ищет запись именно этого айди заказа у именно этого юзера
        if (!deleted) {
            return res.status(404).json({ message: 'Item not found in cart' })
        }

        res.status(200).json({ success: true, message: 'Item removed' })
    } catch (error) {
        next(error)
    }
}