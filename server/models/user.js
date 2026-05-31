const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') //библиоткка для хеширвоания паролей пон

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false //пароль НЕ будет возвращаться в запросах. например в гет запросе не покажет пароль
    }
})    

userSchema.pre('save', async function () { //функция запускается перед сохранением в базу
    if (!this.isModified('password')) return; // если пароль не измеинлся то продолжает
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema)