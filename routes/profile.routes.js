const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")
const createError=require("http-errors");
const { request } = require("../app.js");

router.post("/",async (req, res) => {
  try{
      const email = req.body.email;
      console.log(email);
    const userInfo = await User.findOne({email:email},"-password"); //Exclude password
  console.log(userInfo)
  if(!userInfo)throw createError.NotFound();
  res.status(200).json(userInfo)
  }
    catch(err){
      console.log(err)
    }
});

//Router for updating user info
router.put("/editinfo",async (req, res) => {
  try{
    const {name,city,country,aboutMe,email}=req.body;
  if(!email) throw createError.NotAcceptable();
  const userInfo = await User.findOneAndUpdate({email},{name,city,country,aboutMe},{new:true});
  if(!userInfo)throw createError.NotFound();
  console.log(userInfo);
  res.status(200).json({message:"Data updated successfulyy!"})
  }
    catch(err){
      console.log(err)
      res.json(err);
    }
});

//Router for updating skill update

module.exports = router;