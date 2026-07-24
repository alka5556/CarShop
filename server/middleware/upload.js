const multer = require('multer')
const path = require('path')

const base = "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').filter(Boolean).slice(1).join('.')
        cb(null, Date.now() + "." + ext)
    }
})

const upload = multer({ storage: storage })

module.exports = { upload, base }