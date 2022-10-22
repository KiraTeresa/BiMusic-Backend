const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")
const createError=require("http-errors");
const { request } = require("../app.js");
const Project = require("../models/Project.model.js")

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


router.get("/addedproject/:id",async (req, res) => {
  try{
    const id = req.params.id;
    const projectInfo = await Project.find({initiator:id});
  console.log(projectInfo)
  if(!projectInfo)throw createError.NotFound();
  res.status(200).json(projectInfo);
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
router.put("/editskill",async (req, res) => {
  try{
    const {skill,email}=req.body;
    console.log(skill,email);
  if(!email) throw createError.NotAcceptable();
  const userInfo = await User.findOneAndUpdate({email},{$addToSet:{skills:skill}},{new:true});

  //Add new skill if it doesn't exist in the array (current skillset)
  if(!userInfo)throw createError.NotFound();
  console.log(userInfo);
  res.status(200).json({message:"Data updated successfulyy!"})
  }
    catch(err){
      console.log(err)
      res.json(err);
    }
});


//Delete skillx
router.put("/deleteskill",async (req, res) => {
  try{
    const {skill,email}=req.body;
    console.log(skill,email);
  if(!email) throw createError.NotAcceptable();
  const userInfo = await User.findOneAndUpdate({email},{$pull:{skills:skill}});
  //It will delete the skill from the array
  if(!userInfo)throw createError.NotFound();
  console.log(userInfo);
  res.status(200).json({message:"Data updated successfulyy!"})
  }
    catch(err){
      console.log(err)
      res.json(err);
    }
});



//Delete Account from account settting (this router will ne removed to seperate router file)
router.delete("/deleteaccount",async (req, res) => {
  try{
    const {email}=req.body;
  if(!email) throw createError.NotAcceptable();
  const userInfo = await User.findOneAndDelete({email});
  //It will delete the skill from the array
  if(!userInfo)throw createError.NotFound();
  console.log(userInfo);
  res.status(200).json({message:"Data updated successfulyy!"})
  }
    catch(err){
      console.log(err)
      res.json(err);
    }
});



module.exports = router;