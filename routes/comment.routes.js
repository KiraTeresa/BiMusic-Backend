const express = require("express")
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require("../middleware/isLoggedIn")
const Comment = require("../models/Comment.model.js");
const Project = require("../models/Project.model");
const User = require("../models/User.model");

router.post("/:projectId", isLoggedIn, async (req, res) => {
    const {projectId} = req.params;
    const {commentText} = req.body;
    console.log("Query: ", req.user)

    // create the comment:
    await Comment.create({text: commentText, author: req.user, project: Types.ObjectId(projectId)}).then(async (result) => {

        // add comment to project:
        await Project.findByIdAndUpdate(projectId, {"$push": {comments: result}}, {"new": true}).then(() => res.json("Done adding the comment."))
    }).catch((err) => console.log("Error occured when adding a comment.", err))
})

// get name of author
router.get("/:author", isLoggedIn, async (req, res) => {
    await User.findById(req.params.author).then((result) => res.json(result.name)).catch((err) => console.log("Sorry, no author found.", err))
})

module.exports = router;