const express = require('express')
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require('../middleware/isLoggedIn');
const Chat = require('../models/Chat.model');
const Message = require("../models/Message.model")

router.post("/", isLoggedIn, async (req, res) => {
    // console.log("Data from frontend: ", req.body)
    const {msg, userId, chat} = req.body
    const currentUser = req.user.toString()

    // console.log(">>>>>>>> ", userId, " ", currentUser, "<<<<<<<<<<")

    // if(userId === currentUser){
        await Message.create({author: Types.ObjectId(userId), text: msg}).then(async (newMsg) => {
            await Chat.findByIdAndUpdate(chat, {"$push": {"history": newMsg}}, {"new": true})
            res.status(200).json("got it")
        }).catch(() => console.log("Creating a new chat failed."))
    // } else {
    //     res.status(400).json("You are not who you say you are.")
    // }
})

module.exports = router