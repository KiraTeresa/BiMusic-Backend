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

// updates user status, gets requested on logout
router.put("/:userId", isLoggedIn, async (req, res) => {
  const {userId} = req.params
  await User.findByIdAndUpdate(userId, {status: "offline"}, {new: true}).then(() => res.json("Server successfully set user status to offline.")).catch((err)=>console.log("Updating user status did not work. ", err))
})




module.exports = router;