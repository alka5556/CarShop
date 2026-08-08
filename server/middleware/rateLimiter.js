const rateLimit = require('express-rate-limit')

// Ограничивает число попыток входа с одного IP-адреса.
// Если кто-то пытается подобрать пароль перебором — после 10 неудачных
// попыток за 15 минут этот IP блокируется на оставшееся время окна.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 10, // максимум 10 запросов за окно
    message: { message: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true, // добавляет заголовки RateLimit-* в ответ
    legacyHeaders: false,
})

module.exports = { loginLimiter }