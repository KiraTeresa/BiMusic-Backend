const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const Project = require("../models/Project.model")
const Sample = require("../models/Sample.model")
const Chat = require("../models/Chat.model")
const Message = require("../models/Message.model")
const Feedback = require("../models/Feedback.model")
const Comment = require("../models/Comment.model")
const isLoggedIn = require("../middleware/isLoggedIn")
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'df7tgkzf9',
  api_key: '599894967481117',
  api_secret: '4zXV-CVgioJ3IW0kiMpVrOIOYXY',
  secure: true
});

router.get("/:id", isLoggedIn, async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const userInfo = await User.findOne({
      _id: id
    }, "-password"); //Exclude password
    console.log(userInfo)
    if (!userInfo) throw createError.NotFound();
    res.status(200).json(userInfo)
  } catch (err) {
    console.log(err)
  }
});

// updates user status, gets requested on logout
router.put("/:userId", isLoggedIn, async (req, res) => {
  const {
    userId
  } = req.params
  await User.findByIdAndUpdate(userId, {
    status: "offline"
  }, {
    new: true
  }).then(() => res.json("Server successfully set user status to offline.")).catch((err) => console.log("Updating user status did not work. ", err))
})

//Delete Account from account settting
router.post("/", isLoggedIn, async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "please provide email and password"
      })
    };
    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({
      email
    });
    if (!foundUser) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    // Compare the provided password with the one saved in the database
    const passwordCorrect = await bcrypt.compare(password, foundUser.password);

    if (!passwordCorrect) {
      return res.status(400).json({
        message: "password incorrect"
      })
    };

    // Delete User image from cloudinary
    cloudinary.v2.uploader.destroy(foundUser.cloudinary_id, function (error, result) {
      console.log(result, error)
    });

    // get all projects which are going to be deleted; needed to also delete chats
    const deletedProject = await Project.find({
      initiator: foundUser._id
    });

    await Project.deleteMany({
      initiator: foundUser._id
    });

    // remove from all collab projects
    await Project.updateMany({
      collaborators: {
        $in: foundUser._id
      }
    }, {
      $pull: {
        collaborators: foundUser._id
      }
    }, {
      new: true
    })

    // remove from all project pending lists
    await Project.updateMany({
      pendingCollabs: {
        $in: foundUser._id
      }
    }, {
      $pull: {
        pendingCollabs: foundUser._id
      }
    }, {
      new: true
    })

    //Delete samples from the cloudinary id.
    const foundSamples = await Sample.find({
      artist: foundUser._id
    });
    const samples = foundSamples.map(sample => {
      return sample.cloudinary_id
    })
    cloudinary.v2.api.delete_resources(samples,
      function (error, result) {
        console.log(result);
      });

    await Sample.deleteMany({
      artist: foundUser._id
    });

    await User.findOneAndDelete({
      email: email
    })

    // delete chats of users projects
    for (const proj of deletedProject) {
      // first store all chats which are about to be deleted:
      const deletedChat = await Chat.findOne({
        project: proj._id
      })

      // actually delete the chats:
      await Chat.deleteMany({
        project: proj._id
      })

      // delete all messages of that chat history:
      await Message.deleteMany({
        chatId: deletedChat._id
      })
    }

    // remove user from own messages, but don't delete them
    const usersMessages = await Message.updateMany({
      author: foundUser._id
    }, {
      $unset: {
        author: ""
      },
      $pull: {
        readBy: foundUser._id,
        sendTo: foundUser._id
      }
    }, {
      new: true
    })

    // remove user from own comments, but don't delete them
    await Comment.updateMany({
      author: foundUser._id
    }, {
      $unset: {
        author: ""
      }
    }, {
      new: true
    })

    // remove user from own feedback, but don't delete it
    await Feedback.updateMany({
      author: foundUser._id
    }, {
      $unset: {
        author: ""
      }
    }, {
      new: true
    })


    console.log("Test 1 - ", usersMessages)

    // remove user from other peoples messages
    const otherPeoplesMessages = await Message.updateMany({
      $or: [{
        readBy: {
          $in: foundUser._id
        },
        sendTo: {
          $in: foundUser._id
        }
      }]
    }, {
      $pull: {
        readBy: foundUser._id,
        sendTo: foundUser._id
      }
    }, {
      new: true
    })
    console.log("Test 2 - ", otherPeoplesMessages)

    return res.status(200).json({
      message: "User is deleted!"
    });
  } catch (err) {
    console.log(err);
    next(err)
  }
});

router.put("/", isLoggedIn, async (req, res, next) => {
  try {
    const {
      email,
      password,
      changePassword
    } = req.body;

    console.log(email, password, changePassword);

    if (!email || !password || !changePassword) {
      return res.status(400).json({
        message: "Email, password and new password are required."
      })
    }

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

    if (!passwordRegex.test(changePassword)) {
      return res.status(400).json({
        message: "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter."
      })
    }

    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({
      email
    });
    if (!foundUser) {
      return res.status(400).json({
        message: "User not found"
      })
    }

    // Compare the provided password with the one saved in the database
    const passwordCorrect = await bcrypt.compare(password, foundUser.password);

    if (!passwordCorrect) {
      return res.status(400).json({
        message: "Password doesn't match"
      })
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(changePassword, salt);

    const updatedUser = await User.findOneAndUpdate({
      email
    }, {
      password: hashedPassword
    });
    return res.status(200).json({
      message: "Password is changed!", user: updatedUser
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;