const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js")

router.get("/", (req, res) => {
  res.send("<h1>Hello ow r?</h1>");
});

module.exports = router;
