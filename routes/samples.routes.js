const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')

router.get("/create", (req, res) => {
    console.log("REQ SAMPLE CREATE: ", req.query)
    res.json("Hello from Backend")
})

module.exports = router;