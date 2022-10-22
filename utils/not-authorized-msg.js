function notAuthorizedMessage(res){
    res.status(401).json({errorMessage: "You need to be logged in in order to visit this area."})
}

module.exports = notAuthorizedMessage