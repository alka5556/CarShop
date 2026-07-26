const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, res, next) => { //функция которая служит охранником, проверяя наличие токена
    try {
        let token; //Создается пустая переменная для токена. let потому что потом присвоим ей значение

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not logged in, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); //декодед это обычный распакованный обьект в котором находится айли, рандом, время создания и тд
        //JWT_SECRET это именно печать которая дает понять что это не просто какой-то рандомный сервер а данные которые принадлежат моему серверу, и оно накладывается на токен. JWT_SECRET = то что им=дет после равно и есть та самая печать
        req.user = await User.findById(decoded.id); //Ищем пользователя в MongoDB по ID из токена\
         if (!req.user) {
            return res.status(401).json({ message: 'User not found or deleted' }); // Если пользователя нет в базе (вернулся null), мы НЕ идем дальше
        }
        next(); 

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
//(...roles) => ...
//Это функция, которая принимает массив ролей (например, ['admin']) и возвращает другую функцию (middleware)
//(req, res, next) => ...
//Это и есть сам middleware, который получает доступ к:
//req → содержит req.user.role (установленный protect)
//res → для отправки ответа
exports.authorize = (...roles) => (req, res, next) => { 
    if (!roles.includes(req.user.role)) { //провекра роли, в случае если роль юсер то ошибку хуярит
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
};