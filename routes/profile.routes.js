const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")

router.post("/",async (req, res, next) => {
    try{const email = req.body.email
    const userInfo = await User.findOne({email:email},"-password") //Exclude password from req
  console.log(userInfo)
    res.json(userInfo);}
    catch(err){console.log(err)}
  });
  
  module.exports = router;