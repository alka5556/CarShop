//  роль - только принимает запрос и передаёт контроллеру
const express = require('express')
const router = express.Router()
const carController = require('../controllers/car')

router.post("/", carController.createCar) 
router.get("/", carController.getAllCars) // "GET запрос? иди к getAllCars"
router.get("/:id", carController.getCarById)
router.put("/:id", carController.updateCar)
router.delete("/:id", carController.deleteCar)

module.exports = router