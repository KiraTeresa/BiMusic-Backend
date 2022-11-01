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
    console.log(">>> Connected to WebSocket Backend >>>")
    clients.push({userID: ws})

    ws.on("message", data =>{
        wss.clients.forEach(function each(client) {
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify(JSON.parse(data)))
            }
        })


    // console.log("Client has sent us ----> ", JSON.parse(data))
        // if (JSON.parse(data).msg){
        //     // console.log("Received Message: ", JSON.parse(data).msg)
            
        //     // forward message to all clients:
        //     for(const person of clients){
        //         const usersWebSocket = person.userID
        //         usersWebSocket.send(JSON.stringify(JSON.parse(data)))
        //         // console.log("Message sent to: ", usersWebSocket)
        //     }
        // }
        // ws.send(data.toString())
    })

    ws.on("close", ()=>{
    console.log("<<< Client has disconnected. <<<")
    })
})

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
    }).then(() => res.status(200).json({allProjects, existingChats})).catch((err) => console.log("ERRor: ", err))
})

// create new chat room
router.post("/", isLoggedIn, async (req, res) => {
    console.log("Data from frontend to create new chat: ", req.body)

    await Chat.findOne({project: Types.ObjectId(req.body.newChat)}).then(async (chatFound) => {
        if(chatFound){
            res.status(400).json({message: "The chat for this project already exists."})
        } else {
            await (await Chat.create({project: Types.ObjectId(req.body.newChat)})).populate('project').then((chat) => {
                res.status(200).json(chat)
            })
        }
    }).catch(() => console.log("Creating a new chat failed."))
})

// get single chat room
router.get("/:chatId", isLoggedIn, async (req, res) => {
    const {chatId} = req.params
    const currentUser = req.user
    console.log("ONE")

    await Chat.findById(chatId).populate({path: 'project', populate: {
        path: 'collaborators initiator'}
    }).populate({
        path: 'history',
        populate : {
          path : 'author'
        }
      }).then((chatFound) => {
        console.log("TWO TWO")
        const {initiator, collaborators} = chatFound.project
        const isInitiator = initiator.equals(currentUser)
        const isCollab = collaborators.find((element) => element.equals(currentUser))

        if (isInitiator || isCollab){
            res.json(chatFound)
        } else {
            res.status(400).json({ message: "You need to be a collaborator in order to join the chat." })
            return
        }
    }).catch((err) => console.log("Error when finding the chat data ", err))
})

module.exports = router