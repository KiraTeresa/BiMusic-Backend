const User = require('../models/User.model')
const notAuthorizedMessage = require('../utils/not-authorized-msg')
const jwt = require("jsonwebtoken");
const isAuthenticated = require('./jwt.middleware')

function isLoggedIn(req, res, next){
    console.log("IsLoggedIn Middleware ~~ ", req.headers)

    console.log("Hello????")
    if(!req.headers.authorization) {
        return notAuthorizedMessage(res)
    }

    if (!isAuthenticated){
        return notAuthorizedMessage(res)
    }

    const [, token] = req.headers.authorization.split(" ")
    
    const tokenData = jwt.decode(token)
    
    console.log("token data: ", tokenData)

    User.findById(tokenData._id).select('-password').then((user) => {
        req.user = user._id;
        console.log("Added current user to req >> ", req.user)
        next();
    }).catch((err) => {
        console.log("Error in isLoggedIn middleware: ", err);
        return notAuthorizedMessage
    })
}

module.exports = isLoggedIn;