const express = require('express')
const router = express.Router();
const Project = require("../models/Project.model")
const User = require('../models/User.model')
const mongoose = require('mongoose')
const compareAsc = require('date-fns/compareAsc')

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
    console.log("REQ: ", req.body)
    const {title, shortDescription, longDescription, lookingFor, startDate, endDate, isRemote, city, country, initiator } = req.body
    const user = mongoose.Types.ObjectId(initiator)

    console.log("Start: ", startDate, " End: ", endDate)

    // Validation: title, shortDescription and longDescription are provided
    if(!title || !shortDescription || !longDescription){
        res.status(400).json({ message: "Please provide a title and description." });
        return;
    }

    // Validation: at least one skill added
    if(lookingFor.length === 0){
        res.status(400).json({ message: "Please select at least one skill you are looking for." });
        return;
    }

    // Validation: start not after end of project
    const dateValidation = compareAsc(new Date(startDate), new Date(endDate)) // Compare the two dates and return 1 if the first date is after the second, -1 if the first date is before the second or 0 if dates are equal.   
    if(dateValidation === 1){
        res.status(400).json({ message: "Your project cannot start after it ends, that just doesn't make sense." });
        return;
    }

    // Validation: location set correctly
    if(!isRemote){
        if(!city || !country){
            res.status(400).json({ message: "Please select where the project will be done." });
        return;
        }
    }

    // If all required data has been sent --> add project to db collection:
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