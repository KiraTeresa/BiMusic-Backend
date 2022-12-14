const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const saltRounds = 10;
const createError = require("http-errors");
const isLoggedIn = require("../middleware/isLoggedIn.js");
const bcrypt = require("bcrypt");
const Message = require("../models/Message.model.js");
const Chat = require("../models/Chat.model.js");
const Comment = require("../models/Comment.model")
const jwt = require("jsonwebtoken");

// get user info
router.get("/:username", isLoggedIn, async (req, res, next) => {
  try {
    const {
      username
    } = req.params;
    const userInfo = await User.findOne({
      name: username
    }, "-password").populate("collabProjects ownProjects samples"); //Exclude password
    if (!userInfo) {
      throw createError.NotFound("User Not Found!")
    }
    return res.status(200).json(userInfo)
  } catch (err) {
    next(err)
  }
});

//Router for updating user info
router.put("/editinfo", isLoggedIn, async (req, res, next) => {
  try {
    const {
      name,
      city,
      country,
      aboutMe,
      email
    } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Not authorized"
      })
    }

    const nameTaken = await User.findOne({
      name
    })

    if (nameTaken) {
      return res.status(400).json({
        message: "Username already taken"
      })
    }

    await User.findOneAndUpdate({
      email
    }, {
      name: name.toLowerCase(),
      city,
      country,
      aboutMe
    }, {
      new: true
    }).then((updatedUser) => {
      if (updatedUser) {
        const {
          _id,
          name,
          email
        } = updatedUser;

        // Create an object that will be set as the token payload
        const payload = {
          _id,
          name,
          email
        };

        // Create a new JSON Web Token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        console.log("Token?? ", authToken)
        // Send the token as the response
        return res.status(200).json({
          user: updatedUser,
          authToken: authToken
        });
      } else {
        return res.status(400).json({
          message: "User not found"
        })
      }
    });

  } catch (err) {
    next(err)
  }
});

//Router for updating skill update
router.put("/editskill", isLoggedIn, async (req, res, next) => {
  try {
    const {
      skill,
      email
    } = req.body;
    console.log(skill, email);
    if (!email) {
      return res.status(400).json({
        message: "Not authorized"
      })
    }
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
    if (!userInfo) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    console.log(userInfo);
    return res.status(200).json(userInfo)
  } catch (err) {
    console.log(err)
    next(err)
  }
});


//Delete skillx
router.put("/deleteskill", isLoggedIn, async (req, res, next) => {
  try {
    const {
      skill,
      email
    } = req.body;
    console.log(skill, email);
    if (!email) {
      return res.status(400).json({
        message: "Not authorized"
      })
    }
    const userInfo = await User.findOneAndUpdate({
      email
    }, {
      $pull: {
        skills: skill
      }
    });
    //It will delete the skill from the array
    if (!userInfo) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    console.log(userInfo);
    return res.status(200).json(userInfo)
  } catch (err) {
    console.log(err)
    next(err)
  }
});

router.put("/uploadavatar", isLoggedIn, async (req, res, next) => {
  try {
    const {
      email,
      avatar,
      cloudinary_id
    } = req.body
    if (!req.body) {
      return res.status(400).json({
        message: "No valid input"
      })
    }
    const userInfo = await User.findOneAndUpdate({
      email
    }, {
      avatar,
      cloudinary_id
    });
    //It will delete the skill from the array
    if (!userInfo) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    console.log(userInfo);
    return res.status(200).json({
      message: "Data updated successfulyy!"
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
});

module.exports = router;