const express = require('express')
const router = express.Router();
const Project = require("../models/Project.model")
const User = require('../models/User.model')
const { Types } = require('mongoose')
const compareAsc = require('date-fns/compareAsc');
const { findByIdAndUpdate } = require('../models/Project.model');
const isLoggedIn = require('../middleware/isLoggedIn');


router.get("/", (req, res) => {
    Project.find().populate("initiator").then((result) => {res.json(result)}).catch(err => console.log("ERROR getting data from db ", err))
})

router.get("/create", isLoggedIn,async (req, res) => {
    // console.log("LOOOOOOOK", req.headers)
    const {userId} = req.query

    await User.findById(userId).then((user) => {
        const {country, city} = user
        // console.log("UUUUUser--> ", user)
        // res.json(user)
        res.json({country, city})
    }).catch(console.error)
})

router.post("/create", isLoggedIn,async (req, res) => {
    console.log("REQ: ", req.body)
    const {title, shortDescription, longDescription, lookingFor, startDate, endDate, isRemote, city, country, initiator } = req.body
    const user = Types.ObjectId(initiator)

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
    await Project.create({...req.body, initiator: user}).then(async (newProject) => {
        // console.log("NEW --> ", newProject)

        await User.findByIdAndUpdate(user, {$push: {ownProjects: newProject._id}}, {"new": true}).then(()=> console.log("Added new project to users ownProject array."))

        res.json(newProject._id)
    }).catch((err) => console.log("Something went wrong when creating a new project.", err))
})

router.get('/:projectId', isLoggedIn,async (req, res) => {
    console.log("PARAM--> ", req.params)
    await Project.findById(req.params.projectId).populate("initiator collaborators pendingCollabs").then((project) => {
        // const alreadyCollab = collaborators.find((e) => e._id === )
        res.json(project)
    }).catch((err) => console.log("Fetching the project details failed, ", err))
})

// handle request to join/leave a project:
router.post('/:projectId/:userId', isLoggedIn,async (req, res) => {
    const {projectId, userId} = req.params;
    console.log("-- TRIGGER --")
    console.log("PARAM--> ", req.params)

    await Project.findById(projectId).then(async (project) => {
        const {initiator, collaborators, pendingCollabs} = project;

        // Check if user is initiator:
        const isInitiator = initiator.equals(userId)
        console.log("Initiator? ", isInitiator)

        // Check if already collab:
        const alreadyCollab = await collaborators.find(async (element) => {
            console.log("COL-------", element)
            element.equals(userId)
        })
        console.log("Already? ", alreadyCollab)
        if(alreadyCollab){
            await Project.findByIdAndUpdate(projectId, {"$pull": {"collaborators": Types.ObjectId(userId)}}, {"new": true}).then(() => res.json("Removed from collaborators"))
        }

        // Check if already pending:
        const alreadyPending = await pendingCollabs.find(async (element) => {
            console.log("PEN-------", element)
            element.equals(userId)
        })
        console.log("Pending? ", alreadyPending)
        if(alreadyPending){
            await Project.findByIdAndUpdate(projectId, {"$pull": {"pendingCollabs": Types.ObjectId(userId)}}, {"new": true}).then(() => res.json("Removed from pending"))
        }

        if(!alreadyCollab && !alreadyPending && !isInitiator){
            await Project.findByIdAndUpdate(projectId, {"$push": {"pendingCollabs": Types.ObjectId(userId)}}, {"new": true}).then((result) => {
            console.log("NEW--> ", result);
            res.json(`-- Added user to pending list --`)
            })
        }
    }).catch((err) => console.log("ERR ", err))
})

// accepting user request
router.post('/:projectId/:requestingUserId/accept', isLoggedIn,async (req, res) => {
    const {projectId, requestingUserId} = req.params;

    // add to collaborator array:
    await Project.findByIdAndUpdate(projectId, {"$push": {"collaborators": Types.ObjectId(requestingUserId)}}, {"new": true}).then(async () => {
        
        // remove from pending list:
        await Project.findByIdAndUpdate(projectId, {"$pull": {"pendingCollabs": Types.ObjectId(requestingUserId)}}, {"new": true})}).then(()=> res.json("yeah yeah, user request is taken care of.")).catch((err) => console.log("ErroR: ", err))
})

// rejecting user request
router.post('/:projectId/:requestingUserId/reject', isLoggedIn,async (req, res) => {
    const {projectId, requestingUserId} = req.params;

    // remove from pending list:
    await Project.findByIdAndUpdate(projectId, {"$pull": {"pendingCollabs": Types.ObjectId(requestingUserId)}}, {"new": true}).then(() => res.json("Backend took care of the rejection, you got a clean plate")).catch((err) => console.log("ErroR: ", err))

})

module.exports = router;