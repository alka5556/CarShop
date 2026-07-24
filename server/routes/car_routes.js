//  роль - только принимает запрос и передаёт контроллеру
const express = require('express')
const router = express.Router()
const carController = require('../controllers/car')
const {protect, authorize} = require('../middleware/authMiddleware')
const { upload } = require('../middleware/upload')

router.post("/", protect, authorize('admin'), upload.single('image'), carController.createCar) 
router.get("/", carController.getAllCars) // "GET запрос? иди к getAllCars"
router.get("/:id", carController.getCarById)
router.put("/:id", protect, authorize('admin'), carController.updateCar)
router.delete("/:id", protect, authorize('admin'), carController.deleteCar)

module.exports = router