const express = require('express')
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require('../middleware/isLoggedIn');
const Chat = require('../models/Chat.model');
const Message = require("../models/Message.model")

// add new message to db collection
router.post("/", isLoggedIn, async (req, res) => {
    const {msg, userId, chat} = req.body

    await Message.create({author: Types.ObjectId(userId), text: msg, readBy: Types.ObjectId(userId)}).then(async (newMsg) => {
        await Chat.findByIdAndUpdate(chat, {"$push": {"history": newMsg}}, {"new": true})
        res.status(200).json(newMsg)
    }).catch(() => console.log("Creating a new chat failed."))
})

// get unread messages of single chat room
router.get("/unread/:chatId", isLoggedIn, async (req, res) => {
    const {chatId} = req.params
    const currentUser = Types.ObjectId(req.user)
    const unreadMsg = []
    
    await Chat.findById(chatId).populate('history').then(async (chatInfo)=>{
        const {history} = chatInfo
        
        for(const msg of history){
            await Message.findOne({$and: [{_id: msg.id}, {readBy: {$in: currentUser}}]}).then((msgRead) => {
                if(!msgRead){
                    unreadMsg.push(msg)
                }
            })
        }
    }).then(() => res.json(unreadMsg)).catch(()=> res.status(400).json({message: "Could not get unread messages."}))
})

// set all messages of that single chat as "read"
router.put("/read-all/:chatId", isLoggedIn, async (req, res) => {
    const {chatId} = req.params
    const currentUser = Types.ObjectId(req.user)
    console.log("Current User: ", currentUser)

    await Chat.findById(chatId).populate('history').then(async (chatInfo)=>{
        const {history} = chatInfo
        
        for(const msg of history){
            await Message.findOneAndUpdate({$and: [{_id: msg._id}, {readBy: {$ne: currentUser}}]}, {$push: {readBy: Types.ObjectId(currentUser)}}, {new: true}).then((updatedMsg) => {
                if(updatedMsg){
                    console.log(">>> msg updated <<<")
                } else {
                    console.log("__was already read__")
                }
            })
        }
    }).then(() => res.json("Set all messages of this chat as read.")).catch(()=> res.status(400).json({message: "Could not set unread messages to read."}))
})

// set one message as "read"
router.put("/read-one/:msgId", isLoggedIn, async (req, res) => {
    const {msgId} = req.params
    const currentUser = Types.ObjectId(req.user)

    await Message.findOneAndUpdate({$and: [{_id: msgId}, {readBy: {$ne: currentUser}}]}, {$push: {readBy: Types.ObjectId(currentUser)}}, {new: true}).then(()=>res.status(200).json("Success")).catch(()=>res.status(400).json("Failed to set newly received message as reas."))
})

module.exports = router