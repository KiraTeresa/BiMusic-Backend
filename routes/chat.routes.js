const express = require('express')
const router = express.Router();
const { Types } = require('mongoose')
const WebSocket = require('ws')
const isLoggedIn = require('../middleware/isLoggedIn');
const Project = require("../models/Project.model")
const Chat = require("../models/Chat.model")

// WebSocket Server
const clients = []
const wss = new WebSocket.Server({port: 8082})

wss.on("connection", ws => {
    console.log("Connected to WebSocket Backend ")
    clients.push({userID: ws})

    ws.on("message", data =>{
    console.log("Client has sent us ----> ", JSON.parse(data))
        if (JSON.parse(data).msg){
            console.log("Received Message: ", JSON.parse(data).msg)
            
            // forward message to all clients:
            for(const person of clients){
                const usersWebSocket = person.userID
                usersWebSocket.send(JSON.stringify(JSON.parse(data)))
                // console.log("Message sent to: ", usersWebSocket)
            }
        }
        // ws.send(data.toString())
    })

    ws.on("close", ()=>{
    console.log(">>> Client has disconnected. Sad. <<<")
    })
})

// get active chats of current user & projects list, to create new rooms
router.get("/", isLoggedIn, async (req,res) => {
    // console.log("The REQ: ", req)
    const currentUser = req.user;
    console.log("New client connected. Welcome, ", currentUser)
    let allProjects
    const existingChats = []

    await Project.find({initiator: currentUser}).then(async (projectsArr) => {
        allProjects = projectsArr
    
        for(const proj of allProjects){
            await Chat.findOne({project: Types.ObjectId(proj._id)}).populate('project').then((chatFound) => {
                if(chatFound){
                    existingChats.push(chatFound)
                }
            })
        }
    
    }).then(() => res.status(200).json({allProjects, existingChats})).catch((err) => console.log("ERRor: ", err))
})

// create new chat room
router.post("/", isLoggedIn, async (req, res) => {
    console.log("Data from frontend to create new chat: ", req.body)
    await Chat.create({project: Types.ObjectId(req.body.newChat)}).then(() => {
        res.status(200).json("got it")
    }).catch(() => console.log("Creating a new chat failed."))
})

// get info of single chat room
router.get("/:chatId", isLoggedIn, async (req, res) => {
    await Chat.findById(req.params.chatId).populate("project").populate({
        path: 'history',
        populate : {
          path : 'author'
        }
      }).then((chatFound) => res.json(chatFound)).catch((err) => console.log("Error when finding the chat data ", err))
})

module.exports = router