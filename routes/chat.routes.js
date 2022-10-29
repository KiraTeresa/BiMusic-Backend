const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const WebSocket = require('ws')
const isLoggedIn = require('../middleware/isLoggedIn');

// WebSocket Server
const clients = []
const wss = new WebSocket.Server({port: 8082})

wss.on("connection", ws => {
    console.log("Connected to WebSocket Backend ", ws)
    clients.push({userID: ws})

    ws.on("message", data =>{
    console.log("Client has sent us ----> ", JSON.parse(data))
        if (JSON.parse(data).msg){
            console.log("Received Message: ", JSON.parse(data).msg)
            
            // forward message to all clients:
            for(const person of clients){
                const usersWebSocket = person.userID
                usersWebSocket.send(JSON.stringify(JSON.parse(data)))
                console.log("Message sent to: ", usersWebSocket)
            }
        }
        // ws.send(data.toString())
    })

    ws.on("close", ()=>{
    console.log(">>> Client has disconnected. Sad. <<<")
    })
})

router.get("/", isLoggedIn, (req,res) => {
    // WebSocket Server
    // console.log("The REQ: ", req)
    const currentUser = req.user;
    console.log("New client connected. Welcome, ", currentUser)
    // clients.push(currentUser)

    res.status(200).json("All good")
})

module.exports = router