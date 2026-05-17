const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()

mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to mongo'))

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(bodyParser.json())

const carRoutes = require('./routes/car_routes')
app.use('/cars', carRoutes)

app.listen(3000, () => console.log('Server running on port 3000'))