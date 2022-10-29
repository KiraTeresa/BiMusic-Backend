const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const saltRounds = 10;
const createError = require("http-errors");
const Project = require("../models/Project.model.js");
const Sample=require("../models/Sample.model.js")
const isLoggedIn = require("../middleware/isLoggedIn.js");
const bcrypt = require("bcrypt")

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

//Delete Account from account settting (this router will ne removed to seperate router file)
router.post("/accountsettings", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    console.log(email, password);
    if (!email || !password) throw createError.NotAcceptable();
    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({
      email
    });
    if (!foundUser) throw createError.NotFound("User not found.")

    // Compare the provided password with the one saved in the database
    const passwordCorrect = await bcrypt.compare(password, foundUser.password);

    if (!passwordCorrect) throw createError.Unauthorized("Password doesn't match");
    console.log(foundUser);
    const deletedProject = await Project.deleteMany({
      initiator: foundUser._id
    });
    const deletedSample = await Sample.deleteMany({
      artist: foundUser._id
    });
    const deletedProfile = await User.findOneAndDelete({
      email: email
    })
    res.status(200).json({
      message: "User is deleted!"
    });
  } catch (err) {
    console.log(err);
  }
});

router.put("/accountsettings", async (req, res, next) => {
  try {
    const {
      email,
      password,
      changePassword
    } = req.body;

    console.log(email, password, changePassword);

    if (!email || !password || !changePassword) throw createError.NotAcceptable();

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

    if (!passwordRegex.test(changePassword)) throw createError.NotAcceptable({
      message: "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."
    })

    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({
      email
    });
    if (!foundUser) throw createError.NotFound("User not found.")

    // Compare the provided password with the one saved in the database
    const passwordCorrect = await bcrypt.compare(password, foundUser.password);

    if (!passwordCorrect) throw createError.Unauthorized("Password doesn't match");

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(changePassword, salt);

    const updatedUser = await User.findOneAndUpdate({
      email
    }, {
      password: hashedPassword
    });
    return res.status(200).json({
      message: "Password is changed!"
    });

  } catch (err) {
    console.log(err);
    next(err);
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



module.exports = router;