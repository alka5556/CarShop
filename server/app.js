console.log('APP STARTED')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
require('dotenv').config()

const app = express()

// Список адресов фронтенда, которым разрешено стучаться в API.
// В CLIENT_URL можно положить несколько адресов через запятую.
// Если переменная не задана (локальная разработка) — пускаем всех, как раньше.
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // origin пустой у запросов не из браузера (curl, Postman) — их не режем
        if (!origin || allowedOrigins.length === 0) {
            return callback(null, true)
        }
        callback(null, allowedOrigins.includes(origin.replace(/\/+$/, '')))
    }
}))

// Подключаемся к базе
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection // Получаем объект соединения
db.on('error', error => console.error(error)) // Отслеживание ошибок во время работы базы
db.once('open', () => console.log('connected to mongo')) // Сработает один раз при успешном запуске

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(bodyParser.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url)
    next()
})

// Хостинг регулярно дёргает этот адрес, чтобы понять, что сервис живой
app.get('/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
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

    // Ошибки загрузки файла — это вина клиента, а не сервера
    if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'File is too large (max 5 MB)'
            : err.message
        return res.status(400).json({ message })
    }

    res.status(err.status || 500).json({ message: err.message })
})

// Хостинг сам выдаёт порт через переменную окружения. Жёсткая 3000 работает только на своей машине.
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
