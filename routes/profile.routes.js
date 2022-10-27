const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")
const createError = require("http-errors");
const Project = require("../models/Project.model.js");
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
    console.log(email,password);
    if (!email || !password) throw createError.NotAcceptable();
    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({
      email
    });
    if (!foundUser) {
      // If the user is not found, send an error response
      res.status(401).json({
        message: "User not found."
      });
      return;
    }

    // Compare the provided password with the one saved in the database
    const passwordCorrect = await bcrypt.compare(password, foundUser.password);

    if (passwordCorrect) {
      const deleted = await User.findOneAndDelete({
        email: email
      })
      console.log(deleted);
      res.status(200).json({message:"User is deleted!"});
    } else {
      res.status(401).json({
        message: "Unable to authenticate the user"
      });
    }
  } catch (err) {
    console.log(err);
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