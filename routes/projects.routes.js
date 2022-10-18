const express = require('express')
const router = express.Router();
const Project = require("../models/Project.model")
const mongoose = require('mongoose')

router.get("/", (req, res) => {
    Project.find().then((result) =>
    res.json(result)
    ).catch(err => console.log("ERROR getting data from db ", err))
})

// router.get("/create", (req, res) => {
//     res.json(req.headers)
// })

router.post("/create", async (req, res) => {
    console.log("REQ: ", req.body)
    const user = mongoose.Types.ObjectId(req.body.initiator)

    await Project.create({...req.body, initiator: user}).then((newProject) => {
        console.log("NEW --> ", newProject)
        res.json("Added new project to database")
    }).catch((err) => console.log("Something went wrong when creating a new project.", err))
})

module.exports = router;