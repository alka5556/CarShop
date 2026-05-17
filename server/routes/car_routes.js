const express = require('express')
const router = express.Router()

router.post("/", (req, res) => {
  console.log("post")
  res.send("post")
})

router.get("/", (req, res) => {
  console.log("get")
  res.send("get")
})

router.get("/:id", (req, res) => {
  console.log("get")
  res.send("get")
})

router.put("/:id", (req, res) => {
  console.log("put")
  res.send("put")
})

router.delete("/:id", (req, res) => {
  console.log("delete")
  res.send("delete")
})

module.exports = router