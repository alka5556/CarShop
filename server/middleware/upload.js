const multer = require('multer') //принимает отправленный файл с фронтеда и раскладывает по полочкам
const path = require('path') //работает с путями и папками, нужно чтобы код хорошо работал на виндовс и мак
const fs = require('fs') //File system. может создавать папки, удалять или читать файлы на твоем компьютере.

const base = "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/" //Если в .env 
//написано DOMAIN_BASE=localhost и PORT=3000, 
// то в переменной base получится строка "http://localhost:3000/". 
// Она пригодится, чтобы потом отдавать фронтенду готовые ссылки на картинки

const uploadDir = path.join(__dirname, '..', 'uploads') //вычисляет, где на компьютере должна лежать папка uploads
//path.join() это умный клей. Он смотрит, на какой операционной системе запущен код прямо сейчас, и склеивает папки правильными слэшами.
if (!fs.existsSync(uploadDir)) { //если папки нет создает ее 
    fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({ //говорит мультеру что будет сохранять файл прям на жесткий диск то есть в папку
    destination: function (req, file, cb) {//гооврит что все прилетаемые файлы надо сохранять в uploads 
        cb(null, 'uploads/')
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
        //Когда ты пишешь cb(null, 'uploads/'), ты говоришь мултеру: 
        // null — Ошибок нет, всё прошло идеально!
        // 'uploads/' — Вот тебе результат (папка, куда надо положить файл).
    } else {
        // Отклоняем файл и передаем ошибку
        cb(new Error('You can only put pictures in those formats JPEG, PNG, WEBP or GIF'), false)
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

module.exports = { upload, base }