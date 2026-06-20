console.log('APP STARTED')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())

// Подключаемся к базе
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection // Получаем объект соединения
db.on('error', error => console.error(error)) // Отслеживание ошибок во время работы базы
db.once('open', () => console.log('connected to mongo')) // Сработает один раз при успешном запуске

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(bodyParser.json())

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url)
    next()
})

const carRoutes = require('./routes/car_routes')
app.use('/cars', carRoutes)

const userRoutes = require('./routes/user_routes')
app.use('/users', userRoutes)

const orderRoutes = require('./routes/order_routes')
app.use('/orders', orderRoutes)

const cartRoutes = require('./routes/cart_routes')
app.use('/cart', cartRoutes)

app.use((err, req, res, next) => {
    console.log('ERROR:', err)
    res.status(500).json({ message: err.message })
})

app.listen(3000, () => console.log('Server running on port 3000'))