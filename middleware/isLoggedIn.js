const User = require('../models/User.model')
const notAuthorizedMessage = require('../utils/not-authorized-msg')
const jwt = require("jsonwebtoken");
const isAuthenticated = require('./jwt.middleware')

function isLoggedIn(req, res, next){

    if(!req.headers.authorization) {
        return notAuthorizedMessage(res)
    }

    if (!isAuthenticated){
        return notAuthorizedMessage(res)
    }

    const [, token] = req.headers.authorization.split(" ")
    
    const tokenData = jwt.decode(token)

    User.findById(tokenData._id).select('-password').then((user) => {
        req.user = user._id;
        req.username = user.name;
        next();
    }).catch((err) => {
        console.log("Error in isLoggedIn middleware: ", err);
        return notAuthorizedMessage
    })
}

module.exports = isLoggedIn;