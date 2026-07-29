const multer = require('multer') //принимает отправленный файл с фронтеда и раскладывает по полочкам
const path = require('path') //работает с путями и папками, нужно чтобы код хорошо работал на виндовс и мак
const fs = require('fs') //File system. может создавать папки, удалять или читать файлы на твоем компьютере.

// Хостинги (Render, Railway) стирают диск при каждом перезапуске, поэтому на проде
// картинки уезжают в Cloudinary. Cloudinary включается сам, если в окружении есть ключи.
// Если ключей нет (локальная разработка) — файлы как раньше падают в папку uploads.
const useCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
)

let cloudinary
if (useCloudinary) {
    cloudinary = require('cloudinary').v2
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
}

const uploadDir = path.join(__dirname, '..', 'uploads') //вычисляет, где на компьютере должна лежать папка uploads
//path.join() это умный клей. Он смотрит, на какой операционной системе запущен код прямо сейчас, и склеивает папки правильными слэшами.
if (!useCloudinary && !fs.existsSync(uploadDir)) { //если папки нет создает ее
    fs.mkdirSync(uploadDir, { recursive: true })
}

// С Cloudinary файл держим в памяти и оттуда льём в облако.
// Без Cloudinary — сохраняем на диск, как и раньше.
const storage = useCloudinary
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: function (req, file, cb) { //абсолютный путь, а не 'uploads/' — иначе папка зависела бы от того, из какой директории запущен сервер
            cb(null, uploadDir)
        },
        filename: function (req, file, cb) { //сли два пользователя загрузят фотку с именем котэк.jpg,
            // вторая просто сотрет первую. Чтобы этого не случилось, код берет расширение файла
            //  (например, .jpg) с помощью path.extname, а вместо старого имени ставит Date.now()
            // текущее время в миллисекундах (например, 1721921384921.jpg).
            // Время никогда не идет назад, поэтому все имена картинок гарантированно будут
            // уникальными
            const fileExt = path.extname(file.originalname).toLowerCase()
            cb(null, Date.now() + fileExt)
        }
    })

// 3. БЕЗОПАСНОСТЬ: Фильтр файлов (Разрешаем ТОЛЬКО картинки)
const fileFilter = (req, file, cb) => {
    // Список разрешенных MIME-типов
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true) //Функция cb всегда принимает два аргумента: cb(ОШИБКА, РЕЗУЛЬТАТ)
        //Когда ты пишешь cb(null, uploadDir), ты говоришь мултеру:
        // null — Ошибок нет, всё прошло идеально!
        // uploadDir — Вот тебе результат (папка, куда надо положить файл).
    } else {
        // Отклоняем файл и передаем ошибку
        const error = new Error('You can only put pictures in those formats JPEG, PNG, WEBP or GIF')
        error.status = 400 //чтобы обработчик ошибок отдал 400, а не 500
        cb(error, false)
        //cb это колбэк тип функция-напоминалка: «Сделай вот это, но потом, когда всё будет готово».
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter, //если файл плохой (например, вирус), код вызывает:
    //cb(new Error('Разрешены только изображения...'), false)
    //Здесь на первом месте передается объект ошибки, а на втором — false (отклонить файл).
    limits: {
        fileSize: 5 * 1024 * 1024 //БЕЗОПАСНОСТЬ: Лимит размера файла (5 * 1024 * 1024 байт = 5 Мегабайт)
    }
})

// Отдаёт ссылку на картинку, которую нужно положить в базу.
// Cloudinary -> абсолютный https-адрес.
// Диск -> относительный путь вида /uploads/123.jpg. Домен приклеит фронтенд,
// поэтому база не привязана к конкретному адресу сервера и ссылки не ломаются при переезде.
const saveImage = async (file) => {
    if (!file) {
        return ''
    }

    if (!useCloudinary) {
        return '/uploads/' + file.filename
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'carshop' },
            (error, result) => {
                if (error) {
                    return reject(error)
                }
                resolve(result.secure_url)
            }
        )
        stream.end(file.buffer)
    })
}

module.exports = { upload, saveImage, useCloudinary }
