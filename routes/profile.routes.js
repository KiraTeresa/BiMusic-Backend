const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const saltRounds = 10;
const createError = require("http-errors");
const Project = require("../models/Project.model.js");
const Sample = require("../models/Sample.model.js")
const isLoggedIn = require("../middleware/isLoggedIn.js");
const bcrypt = require("bcrypt");
const Message = require("../models/Message.model.js");
const Chat = require("../models/Chat.model.js");
const Comment = require("../models/Comment.model")

router.post("/", async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const userInfo = await User.findOne({
      email: email
    }, "-password"); //Exclude password
    console.log(userInfo)
    if (!userInfo) throw createError.NotFound();
    res.status(200).json(userInfo)
  } catch (err) {
    console.log(err)
  }
});


router.get("/addedproject/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const projectInfo = await Project.find({
      initiator: id
    });
    console.log(projectInfo)
    if (!projectInfo) throw createError.NotFound();
    res.status(200).json(projectInfo);
  } catch (err) {

  }
});

//Router for updating user info
router.put("/editinfo", async (req, res) => {
  try {
    const {
      name,
      city,
      country,
      aboutMe,
      email
    } = req.body;
    if (!email) throw createError.NotAcceptable();
    const userInfo = await User.findOneAndUpdate({
      email
    }, {
      name,
      city,
      country,
      aboutMe
    }, {
      new: true
    });
    if (!userInfo) throw createError.NotFound();
    console.log(userInfo);
    res.status(200).json({
      message: "Data updated successfulyy!"
    })
  } catch (err) {
    console.log(err)
    res.json(err);
  }
});

//Router for updating skill update
router.put("/editskill", async (req, res) => {
  try {
    const {
      skill,
      email
    } = req.body;
    console.log(skill, email);
    if (!email) throw createError.NotAcceptable();
    const userInfo = await User.findOneAndUpdate({
      email
    }, {
      $addToSet: {
        skills: skill
      }
    }, {
      new: true
    });

    //Add new skill if it doesn't exist in the array (current skillset)
    if (!userInfo) throw createError.NotFound();
    console.log(userInfo);
    res.status(200).json({
      message: "Data updated successfulyy!"
    })
  } catch (err) {
    console.log(err)
    res.json(err);
  }
});


//Delete skillx
router.put("/deleteskill", async (req, res) => {
  try {
    const {
      skill,
      email
    } = req.body;
    console.log(skill, email);
    if (!email) throw createError.NotAcceptable();
    const userInfo = await User.findOneAndUpdate({
      email
    }, {
      $pull: {
        skills: skill
      }
    });
    //It will delete the skill from the array
    if (!userInfo) throw createError.NotFound();
    console.log(userInfo);
    res.status(200).json({
      message: "Data updated successfulyy!"
    })
  } catch (err) {
    console.log(err)
    res.json(err);
  }
});

router.put("/uploadavatar", async (req, res) => {
  try {
    const {
      email,
      avatar,
      cloudinary_id
    } = req.body
    if (!req.body) throw createError.NotAcceptable();
    const userInfo = await User.findOneAndUpdate({
      email
    }, {
      avatar,
      cloudinary_id
    });
    //It will delete the skill from the array
    if (!userInfo) throw createError.NotFound();
    console.log(userInfo);
    res.status(200).json({
      message: "Data updated successfulyy!"
    })
  } catch (err) {
    console.log(err)
    res.json(err);
  }
});

router.get("/collaboratedprojects/:id", async (req, res) => {
  try {
    if (!req.params) throw createError.NotAcceptable();
    const id = req.params.id;
    const collaboratedProjects = await Project.find({
      collaborators: id
    });
    if (!collaboratedProjects) throw createError.NotFound();
    console.log(collaboratedProjects);
    res.status(200).json(collaboratedProjects)
  } catch (err) {
    console.log(err)
    res.json(err);
  }
})

module.exports = router;