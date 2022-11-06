const express = require('express')
const router = express.Router();
const { Types } = require('mongoose')
const isLoggedIn = require('../middleware/isLoggedIn');
const Project = require("../models/Project.model")
const Chat = require("../models/Chat.model")


// get active chats of current user & projects list, to create new rooms
router.get("/", isLoggedIn, async (req,res) => {
    const currentUser = req.user;
    let allProjects
    const existingChats = []

    // get chats of the projects where user is initiator:
    await Project.find({initiator: currentUser}).then(async (projectsArr) => {
        allProjects = projectsArr
    
        for(const proj of allProjects){
            await Chat.findOne({project: Types.ObjectId(proj._id)}).populate('project').then((chatFound) => {
                if(chatFound){
                    existingChats.push(chatFound)
                }
            })
        }

    // get chats of the projects where user is collaborator:  
    }).then(async ()=> {
        await Project.find({collaborators: {$in: currentUser}}).then(async (collabProj) => {
            for(const proj of collabProj){
                await Chat.findOne({project: Types.ObjectId(proj._id)}).populate('project').then((chatFound) => {
                    if(chatFound){
                        existingChats.push(chatFound)
                    }
                })
            }
        })
    }).then(() => res.status(200).json({allProjects, existingChats})).catch((err) => res.status(500).json({message: "Error occured when trying to load chat list.", err}))
})

// create new chat room
router.post("/", isLoggedIn, async (req, res) => {
    const {newChat} = req.body
    const currentUser = req.user

    // check if user is initiator of this project:
    const isInitiator = await Project.findOne({$and: [{_id: newChat}, {initiator: {$in: currentUser}}]})

    if(!isInitiator){
        res.status(400).json({message: "You need to be the initiator of the project in order to create the chat room."})
    }

    // check if user sent valid input:
    if(Object.keys(newChat).length !== 0){
        await Chat.findOne({project: Types.ObjectId(newChat)}).then(async (chatFound) => {
            if(chatFound){
                res.status(400).json({message: "The chat for this project already exists."})
            } else {
                await (await Chat.create({project: Types.ObjectId(newChat)})).populate('project').then((chat) => {
                    res.status(200).json(chat)
                })
            }
        }).catch(() => console.log("Creating a new chat failed."))
    } else {
            res.status(400).json({message: "Please select a project in order to create a chat."})
    }
})

// get single chat room
router.get("/:chatId", isLoggedIn, async (req, res) => {
    const {chatId} = req.params
    const currentUser = req.user

    await Chat.findById(chatId).populate({path: 'project', populate: {
        path: 'collaborators initiator'}
    }).populate({
        path: 'history',
        populate : {
          path : 'author'
        }
      }).then((chatFound) => {
        const {initiator, collaborators} = chatFound.project
        const isInitiator = initiator.equals(currentUser)
        const isCollab = collaborators.find((element) => element.equals(currentUser))

        if (!isInitiator && !isCollab){
            res.status(400).json({ message: "You need to be a collaborator in order to join the chat." })
            return
        }

        // get only message history since user is part of the chat:
        const usersHistory = []
        
        chatFound.history.map((msg) => {
            // const userWasPart = msg.sendTo.includes(currentUser)
            if(msg.sendTo.includes(currentUser)){
                if(msg.author){
                    usersHistory.push(msg)
                } else {
                    console.log("MSG: ", msg)
                    // mark msg from deleted users:
                    const msgFromDeletedUser = {
                        author: {name: "deleted user"},
                        text: msg.text,
                        sendTo: msg.sendTo,
                        readBy: msg.readBy,
                        chatId: msg.chatId,
                        createdAt: msg.createdAt,
                        _id: msg._id
                    }
                    usersHistory.push(msgFromDeletedUser)
                }
            }
        })

        if (isInitiator || isCollab){
            res.json({chatFound, usersHistory})
        }
    }).catch((err) => res.status(500).json({message: "Error when finding the chat data ", err}))
})

module.exports = router