const mongoose = require('mongoose')

const carSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    km: {
        type: Number,
        required: true
    },
    image: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true
    }
})    

module.exports = mongoose.model('Car', carSchema)