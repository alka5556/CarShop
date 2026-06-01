const jwt = require('jsonwebtoken')
const User = require('../models/user')

const generateToken = (id) => {
    return jwt.sign( //создает токен и подписывает его секретным ключом 
        {id}, //это данные, которые будут внутри токена
        process.env.JWT_SECRET, //секретный ключ из .env. Он нужен, чтобы: подписать токен и защитить от подделки
        {expiresIn: process.env.JWT_EXPIRE || '20d'}
    )
}

exports.registration = async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })

    const savedUser = await user.save()
    const token = generateToken(savedUser._id)
    res.status(201).json({success: true, token})

  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({message: 'Please enter email and password'})
        }

        const user = await User.findOne({email}).select('+password')

        if (!user) {
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const token = generateToken(user._id)
        res.status(200).json({success: true, token})

    } catch (error) {
        next (error)
    }
}