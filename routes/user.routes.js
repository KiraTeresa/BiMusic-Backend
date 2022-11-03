const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const isLoggedIn = require("../middleware/isLoggedIn")
const createError = require("http-errors");

router.get("/:id", async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const userInfo = await User.findOne({
      _id: id
    }, "-password"); //Exclude password
    console.log(userInfo)
    if (!userInfo) throw createError.NotFound();
    res.status(200).json(userInfo)
  } catch (err) {
    console.log(err)
  }
});

// updates last login date, gets requested on logout
router.put("/:userId", isLoggedIn, async (req, res) => {
  const {userId} = req.params
  await User.findByIdAndUpdate(userId, {lastLogin: new Date()}, {new: true}).then(() => res.json("Server successfully updated login date.")).catch((err)=>console.log("Updating login date did not work. ", err))
})




module.exports = router;