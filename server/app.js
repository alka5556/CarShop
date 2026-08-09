console.log('APP STARTED')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs') //модуль для проверки а папка dist ваще сущестует?
require('dotenv').config()

const app = express()
app.set('trust proxy', 1);

//по сути блок корс. разбирает ссылку на список адресов, убирает пробелы и слжши в конце
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

//если CLIENT_URL не задан (allowedOrigins.length === 0) — пускать всех. 
// Именно поэтому на Render, где CLIENT_URL не задаётся, CORS практически "спит" и не мешает.
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

// Все маршруты API живут под /api.
// Это не украшательство: страницы сайта /cart и /orders совпадают по адресу
// с эндпоинтами API. Без префикса перезагрузка страницы на /cart отдавала бы
// JSON с ошибкой 401 вместо самой страницы.
const carRoutes = require('./routes/car_routes')
app.use('/api/cars', carRoutes)

const userRoutes = require('./routes/user_routes')
app.use('/api/users', userRoutes)

const orderRoutes = require('./routes/order_routes')
app.use('/api/orders', orderRoutes)

const cartRoutes = require('./routes/cart_routes')
app.use('/api/cart', cartRoutes)

// Отдаём собранный фронтенд с этого же сервера
// Тогда сайт и API живут на одном адресе: не нужны ни CORS, ни VITE_API_URL,
// ни второй хостинг. Если сборки нет (локальная разработка через `npm run dev`
// на порту 5173) — блок просто пропускается, и сервер работает как обычный API.
const clientDist = path.join(__dirname, '..', 'client', 'carshop', 'dist')

//по сути вопрос а фронтед собран? то есть при локальном запуске dist пропускается, 
// раьотает все как чистый апи, если мы на хсотинге запускаем гибридный режим
if (fs.existsSync(path.join(clientDist, 'index.html'))) { //есть папка дист?
    app.use(express.static(clientDist)) //Раздаем статические файлы: картинки, CSS, JS-бандл React.
    //дА, папка есть! (Мы на хостинге или сделали npm run build).

    const apiPrefixes = ['/api', '/uploads', '/health'] //адреса обслуживают сервер, запоминаем их что оин не странциы сайта 

    // ловушка, перехват всего что не попало в правила выше.
    //  всё остальное отдаём в index.html, иначе React Router сломается при
    app.get('/*splat', (req, res, next) => { //// /*splat означает "любой путь, который не был обработан выше".
        const isApi = apiPrefixes.some(p => req.path === p || req.path.startsWith(p + '/'))
        //проврка а вдруг все же эт апи?
        //начинается с /api, /uploads или /heлф
        if (isApi) { //если апи запрос то говорим ему "некст"
            return next()
        }
        ////ЕСЛИ ЭТО НЕ API (например, пользователь обновил страницу /cart):
        // Мы отдаем ему главный файл index.html.
        // Браузер его получает, загружает React, а React Router (внутри браузера) 
        // видит путь /cart и сам рисует нужный компонент!
        res.sendFile(path.join(clientDist, 'index.html'))
    })

    console.log('serving client build from', clientDist)
} else {
    console.log('client build not found — running as API only')
}

app.use((err, req, res, next) => {
    console.log('ERROR:', err)

    // Ошибки загрузки файла картинки, вина клиента
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
