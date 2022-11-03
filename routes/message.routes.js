const express = require('express')
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require('../middleware/isLoggedIn');
const Chat = require('../models/Chat.model');
const Message = require("../models/Message.model")

// add new message to db collection
router.post("/", isLoggedIn, async (req, res) => {
    const {msg, userId, chat, sendTo} = req.body

    await Message.create({author: Types.ObjectId(userId), text: msg, readBy: Types.ObjectId(userId), sendTo, chatId: Types.ObjectId(chat)}).then(async (newMsg) => {
        await Chat.findByIdAndUpdate(chat, {"$push": {"history": newMsg}}, {"new": true})
        res.status(200).json(newMsg)
    }).catch(() => console.log("Creating a new chat failed."))
})

// get all unread messages of a user
router.get("/unread", isLoggedIn, async (req, res) => {
    const currentUser = Types.ObjectId(req.user)
    
    await Message.find({$and: [{sendTo: {$in: currentUser}}, {readBy: {$ne: currentUser}}]}).then((allUnreadMsg) => res.status(200).json(allUnreadMsg)).catch((err) => res.status(400).json(err))
})

// get unread messages of single chat room
router.get("/unread/:chatId", isLoggedIn, async (req, res) => {
    const chat = Types.ObjectId(req.params.chatId)
    const currentUser = Types.ObjectId(req.user)
    // const unreadMsg = []

    await Message.find({$and: [{chatId: chat}, {sendTo: {$in: currentUser}}, {readBy: {$ne: currentUser}}]}).then((unreadMsgArr) => res.json(unreadMsgArr)).catch(()=> res.status(400).json({message: "Could not get unread messages."}))
})

// set all messages of that single chat as "read"
router.put("/read-all/:chatId", isLoggedIn, async (req, res) => {
    const chat = Types.ObjectId(req.params.chatId)
    const currentUser = Types.ObjectId(req.user)

    await Message.updateMany({$and: [{chatId: chat}, {sendTo: {$in: currentUser}}, {readBy: {$ne: currentUser}}]}, {$push: {readBy: currentUser}}, {new: true}).then(() => res.json("Set all messages of this chat as read.")).catch(()=> res.status(400).json({message: "Could not set unread messages to read."}))
})

// set one message as "read"
router.put("/read-one/:msgId", isLoggedIn, async (req, res) => {
    const {msgId} = req.params
    const currentUser = Types.ObjectId(req.user)

    await Message.findOneAndUpdate({$and: [{_id: msgId}, {readBy: {$ne: currentUser}}]}, {$push: {readBy: Types.ObjectId(currentUser)}}, {new: true}).then(() => res.status(200).json("Success")).catch(() => res.status(400).json("Failed to set newly received message as reas."))
})

module.exports = router