const Car = require('../models/car')
const mongoose = require('mongoose')

exports.createCar = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ""
    const car = new Car({
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      price: req.body.price,
      imageUrl: imageUrl
    })

    const savedCar = await car.save() // сохраняется в монгодб. кар сейв это метод который записывает обьект в базу. благодаря ему уже отображается с айди в монгодб
    res.json(savedCar) // сохраненная машина показывается клиенту 

  } catch (error) {
    res.status(400).json({ message: error.message }) // на случай ошибочек
  }
}

exports.getAllCars = async (req, res) => {
  try {
    let cars
    if (req.query.brand) {
        // если в запросе есть ?brand(бренд - тобишь наш параметр))= что-то
      cars = await Car.find({ brand: req.query.brand }) // ищется только этот бренд
    } else {
        // если брэнд не указан
      cars = await Car.find() // возвращаются абсолютно все машины 
    }
    res.json(cars)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(
      new mongoose.Types.ObjectId(req.params.id)
    )
    res.json(car)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

exports.updateCar = (req, res) => {
  console.log("put")
  res.send("put")
}

exports.deleteCar = async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id)
    res.json({ message: "Car deleted" })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}