const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.post("/profile",async (req, res, next) => {
  try{const email = req.body.email
  const userInfo = await User.findOne({email:email})
  res.json(userInfo);}
  catch(err){console.log(err)}
});

module.exports = router;
