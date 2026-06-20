const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'pending'
    },
    amount: {
    type: Number,
    required: true
    }
},
{timestamps: true})    

module.exports = mongoose.model('Order', orderSchema)