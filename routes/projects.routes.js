const express = require('express')
const router = express.Router();
const Project = require("../models/Project.model")
const User = require('../models/User.model')
const mongoose = require('mongoose')

router.get("/", (req, res) => {
    Project.find().populate("initiator").then((result) => {res.json(result)}).catch(err => console.log("ERROR getting data from db ", err))
})

router.get("/create", async (req, res) => {
    // console.log("LOOOOOOOK", req.headers)
    const {userId} = req.query

    await User.findById(userId).then((user) => {
        const {country, city} = user
        // console.log("UUUUUser--> ", user)
        // res.json(user)
        res.json({country, city})
    }).catch(console.error)
})

router.post("/create", async (req, res) => {
    // console.log("REQ: ", req.body)
    const user = mongoose.Types.ObjectId(req.body.initiator)

    // TO DO: validation of data?

    await Project.create({...req.body, initiator: user}).then((newProject) => {
        // console.log("NEW --> ", newProject)
        res.json(newProject._id)
    }).catch((err) => console.log("Something went wrong when creating a new project.", err))
})

router.get('/:projectId', async (req, res) => {
    console.log("PARAM--> ", req.params)
    await Project.findById(req.params.projectId).populate("initiator").then((project) => {
        res.json(project)
    }).catch((err) => console.log("Fetching the project details failed, ", err))
})

module.exports = router;