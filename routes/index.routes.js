const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

module.exports = router;
