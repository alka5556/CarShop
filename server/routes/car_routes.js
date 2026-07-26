//  роль - только принимает запрос и передаёт контроллеру
const express = require('express')
const router = express.Router()
const carController = require('../controllers/car')
const {protect, authorize} = require('../middleware/authMiddleware')
const { upload, base } = require('../middleware/upload')

router.post("/", protect, authorize('admin'), upload.single('image'), carController.createCar) //протект берет токкен из заголовка Authorization: Bearer <token> и проверяет его валидность, если req user валидный то добавляет данные пользователя(айди, его роль) и передает следуюшему middleware
//upload.single('image'): Парсит загруженный файл (фото)
//Сохраняет его в папку uploads
//Добавляет в req.file информацию о файле:
router.get("/", carController.getAllCars) // "GET запрос? иди к getAllCars"
router.get("/:id", carController.getCarById)
router.put("/:id", protect, authorize('admin'), carController.updateCar)
router.delete("/:id", protect, authorize('admin'), carController.deleteCar)

module.exports = router