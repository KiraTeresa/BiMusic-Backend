const express = require("express")
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require("../middleware/isLoggedIn")
const Feedback = require("../models/Feedback.model.js");
const Sample = require("../models/Sample.model");

router.post("/:sampleId", isLoggedIn, async (req, res) => {
    const {sampleId} = req.params;
    const {title, text} = req.body.form;

    if(!text || !title){
        res.status(400).json({message: "Title and text are required."})
    }

    // create the feedback:
    await Feedback.create({title, text, author: req.user, sample: Types.ObjectId(sampleId)}).then(async (result) => {

        // add feedback to sample:
        await Sample.findByIdAndUpdate(sampleId, {"$push": {feedback: result}}, {"new": true}).then(() => res.json("Done adding the feedback."))
    }).catch((err) => console.log("Error occured when adding a feedback.", err))
})

module.exports = router;