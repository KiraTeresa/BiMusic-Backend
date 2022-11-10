const express = require('express')
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require('../middleware/isLoggedIn');
const Chat = require('../models/Chat.model');
const Message = require("../models/Message.model")

// add new message to db collection
router.post("/", isLoggedIn, async (req, res) => {
    const {msg, chat, sendTo} = req.body
    const currentUser = req.user

    await Message.create({author: Types.ObjectId(currentUser), text: msg, readBy: Types.ObjectId(currentUser), sendTo, chatId: Types.ObjectId(chat)}).then(async (newMsg) => {
        if(newMsg){
            await Chat.findByIdAndUpdate(chat, {"$push": {"history": newMsg}}, {"new": true})
            res.status(200).json(newMsg)
        } else {
            res.status(400).json({message: "Your message couldn't be send, please try again."})
        }
    }).catch((err) => res.status(500).json({message: "Creating a new message failed.", err}))
})

// get all unread messages of a user
router.get("/unread", isLoggedIn, async (req, res) => {
    const currentUser = Types.ObjectId(req.user)
    
    await Message.find({$and: [{sendTo: {$in: currentUser}}, {readBy: {$ne: currentUser}}]}).then((allUnreadMsg) => res.status(200).json(allUnreadMsg)).catch((err) => res.status(500).json({message: "Could not get your unread messages.", err}))
})

// get unread messages of single chat room
router.get("/unread/:chatId", isLoggedIn, async (req, res) => {
    const chat = Types.ObjectId(req.params.chatId)
    const currentUser = Types.ObjectId(req.user)

    await Message.find({$and: [{chatId: chat}, {sendTo: {$in: currentUser}}, {readBy: {$ne: currentUser}}]}).then((unreadMsgArr) => res.status(200).json(unreadMsgArr)).catch((err)=> res.status(500).json({message: "Could not get unread messages for the chat room.", err}))
})

// set all messages of that single chat as "read"
router.put("/read-all/:chatId", isLoggedIn, async (req, res) => {
    const chat = Types.ObjectId(req.params.chatId)
    const currentUser = Types.ObjectId(req.user)

    await Message.updateMany({$and: [{chatId: chat}, {sendTo: {$in: currentUser}}, {readBy: {$ne: currentUser}}]}, {$push: {readBy: currentUser}}, {new: true}).then(() => res.status(200).json()).catch((err)=> res.status(500).json({message: "Could not set unread messages to read.", err}))
})

// set one message as "read"
router.put("/read-one/:msgId", isLoggedIn, async (req, res) => {
    const {msgId} = req.params
    const currentUser = Types.ObjectId(req.user)

    await Message.findOneAndUpdate({$and: [{_id: msgId}, {readBy: {$ne: currentUser}}]}, {$push: {readBy: Types.ObjectId(currentUser)}}, {new: true}).then(() => res.status(200).json()).catch((err) => res.status(500).json({message: "Failed to set newly received message as reas.", err}))
})

module.exports = router