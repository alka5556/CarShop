const jwt = require('jsonwebtoken')
const User = require('../models/user')

const generateTokens = (id) => {
    const random = Math.floor(Math.random() * 1000000)
    
    const accessToken = jwt.sign(//создает токен и подписывает его секретным ключом 
        { id, random },//это данные, которые будут внутри токена
        process.env.JWT_SECRET,//секретный ключ из .env. Он нужен, чтобы: подписать токен и защитить от подделки
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    )
    const refreshToken = jwt.sign(
        { id, random },
        process.env.JWT_SECRET,  // тот же секрет!
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '20d' }
    )
    return { accessToken, refreshToken }
}

//то есть нам нужен имя пользователя имейл и пароль, вводит это, юзер 
// сохраняется в монгодб, затем вызывается функция генерации токенов, в которое мы вводим 
// айди из монгодб, получаем рефреш токен и аксес токен, рефреш токен сохраняется в массив 
// под именем пользователя в базе, возвращает аксес токен и рефреш токен
exports.registration = async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    const savedUser = await user.save()
    const { accessToken, refreshToken } = generateTokens(savedUser._id)

      savedUser.refreshTokens = [refreshToken]
      await savedUser.save()

     res.status(201).json({ success: true, accessToken, refreshToken })

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

        const { accessToken, refreshToken } = generateTokens(user._id)

        user.refreshTokens = user.refreshTokens || [] //если рефреш токен есть оставляем как есть, иначе создаем пустое место
        user.refreshTokens.push(refreshToken) //добавляем новый токен в массив
        await user.save()

        res.status(200).json({ success: true, accessToken, refreshToken })

    } catch (error) {
        next (error)
    }
}

exports.logout = async (req, res, next) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(400).json({ message: 'missing refresh token' })
    }

    if (!process.env.JWT_SECRET) {
        return res.status(400).json({ message: 'missing auth configuration' })
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, data) => {
        if (err) {
            return res.status(403).json({ message: 'invalid token' })
        }
        try {
            const user = await User.findById(data.id)
            if (!user) {
                return res.status(400).json({ message: 'invalid token' })
            }

            if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
                user.refreshTokens = []
                await user.save()
                return res.status(400).json({ message: 'invalid token' })
            }

            user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
            await user.save()

            res.status(200).json({ success: true, token: null })
        } catch (err) {
            res.status(400).json({ message: 'invalid token' })
        }
    })
}

exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(400).json({ message: 'missing refresh token' })
        }

        // проверяем токен что он настоящий и подписан правильным секретом. если все ок возвращает даннные еоторые лежат внутри токена и сохраняются в переменную декодед
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

        // находим юзера
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(400).json({ message: 'invalid token' })
        }

        // есть ли токен в базе
        if (!user.refreshTokens.includes(refreshToken)) {
            user.refreshTokens = []
            await user.save()
            return res.status(400).json({ message: 'invalid token' })
        }

        // генерируем новые токены
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id)

        // старый удаляем, новый сохраняем
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
        user.refreshTokens.push(newRefreshToken)
        await user.save()

        res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    } catch (error) {
        next(error)
    }
}

exports.profile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-refreshTokens') //минус чтобы скрыть токены
        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }
        res.status(200).json({success: true, user})
    } catch (error) {
        next(error)
    }
}