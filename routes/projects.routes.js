const express = require('express')
const router = express.Router();
const Project = require("../models/Project.model")

router.get("/", (req, res)=>{
    Project.find().then((result) =>
    res.json(result)
    ).catch(err => console.log("ERROR getting data from db ", err))
})

module.exports = router;