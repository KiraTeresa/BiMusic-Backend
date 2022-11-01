const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
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





module.exports = router;