const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') //библиоткка для хеширвоания паролей пон

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false //пароль НЕ будет возвращаться в запросах. например в гет запросе не покажет пароль
    },
    role: {
        type: String,
        enum: ['user', 'admin'],  // монгодб разрешает ТОЛЬКО эти два значения
        default: 'user'      // если при регистрации не указать роль то автоматически будет 'user'
    },
    refreshTokens: [{ //массив токенов
        type: String 
    }]
},
{ timestamps: true })    

userSchema.pre('save', async function () { //функция запускается перед сохранением в базу
    if (!this.isModified('password')) return; // если пароль не измеинлся то продолжает
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) { //добавляем новый метод у 
// схемы, метод является асинхронной функцией пользователь вводит пароль который 
// попадает в скобки затем пароль введенный и пароль в базе данных под хэшем сравниванивается
// по сути user.matchPassword("123456")
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema)