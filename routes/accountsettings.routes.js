const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const isLoggedIn = require("../middleware/isLoggedIn")
const createError = require("http-errors");

//Delete Account from account settting (this router will ne removed to seperate router file)
router.post("/", async (req, res) => {
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

    // get all projects which are going to be deleted; needed to also delete chats
    const deletedProject = await Project.find({
      initiator: foundUser._id
    });

    await Project.deleteMany({
      initiator: foundUser._id
    });

    const deletedSample = await Sample.deleteMany({
      artist: foundUser._id
    });
    const deletedProfile = await User.findOneAndDelete({
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
        author: "",
        text: "-"
      },
      $pull: {
        readBy: foundUser._id,
        sendTo: foundUser._id
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

    res.status(200).json({
      message: "User is deleted!"
    });
  } catch (err) {
    console.log(err);
  }
});

router.put("/", async (req, res, next) => {
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

module.exports = router;