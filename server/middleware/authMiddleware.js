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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next(); //возвращает null. nullable стоит дать.

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
};