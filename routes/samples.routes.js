const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project.model');
const Sample = require('../models/Sample.model');

router.get("/create", async (req, res) => {
    console.log("REQ SAMPLE CREATE: ", req.query)
    const {projectId} = req.query
    if(projectId){
        await Project.findById(projectId).populate('initiator').then((project)=> res.json(project)).catch(err => console.log(err))}

    else {
        res.json("Hello from Backend")
    }
})

router.post("/create", async (req, res) => {
    console.log("BODY: ", req.body)
    const {form, projectId} = req.body
    const user = mongoose.Types.ObjectId(form.artist);

    // TO DO: Validation for valid link
    // Cloudinary???

    await Sample.create({...form, artist: user}).then(async(newSample)  => {
         console.log("Created new sample in db: ", newSample)
         
             if(projectId){
                 await Project.findByIdAndUpdate(projectId, {sample: newSample}, {new: true}).then((updatedProject) => {
                    console.log("Sample was added to Project: ", updatedProject)
                 })
             }

             console.log("Successfully added a sample")
             res.json("Backend done with adding new sample.")
    }).catch((err) => console.log("Something went wrong when adding a new sample.", err))
})

module.exports = router;