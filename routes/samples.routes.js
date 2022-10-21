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
    const {finalForm, projectId} = req.body
    const user = mongoose.Types.ObjectId(finalForm.artist);
    const {link, linkType, title, year } = finalForm;

    // Validation: title is required
    if(!title){
       res.status(400).json({ message: "Please provide a title." });
       return;
    }

    // TO DO >>> Cloudinary

    // Validation: link
    const isValidUrl = urlString => {
        try { 
            return Boolean(new URL(urlString)); 
        }
        catch(e){ 
            return false; 
        }
    }

    if(!link || !isValidUrl(link)){
        res.status(400).json({message: "Please provide a valid link to your sample (must contain http or https protocol)."});
        return;
    }

    // Validation: link type
    if(linkType !== "audio" && linkType !== "video"){
        res.status(400).json({message: "Link type 'audio' or 'video' must me checked"});
        return;
    }

    // Validation: year is number and not in future
    const currentYear = new Date().getFullYear()
    if(typeof year !== "number" || year > currentYear){
        res.status(400).json({message: "Please provide a valid year which is not in the future."});
        return;
    }

    // If all required data has been sent --> add sample to db collection:
    await Sample.create({...finalForm, artist: user}).then(async(newSample)  => {
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