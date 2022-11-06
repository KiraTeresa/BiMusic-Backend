const express = require("express")
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require("../middleware/isLoggedIn")
const Comment = require("../models/Comment.model.js");
const Project = require("../models/Project.model");

router.post("/:projectId", isLoggedIn, async (req, res) => {
    const {projectId} = req.params;
    const {text} = req.body.form;

    if(!text){
        res.status(400).json({message: "Forgot to type the actual comment?"})
    }

    // create the comment:
    await Comment.create({text, author: req.user, project: Types.ObjectId(projectId)}).then(async (result) => {

        // add comment to project:
        await Project.findByIdAndUpdate(projectId, {"$push": {comments: result}}, {"new": true}).then(() => res.json("Comment successfully added."))
    }).catch((err) => res.status(500).json({message: "Please try again", err}))
})

module.exports = router;