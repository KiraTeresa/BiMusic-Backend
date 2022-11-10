const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Welcome at BiMusic</h1><h2>The collaboration platform for musicians</h2><p>This web app was build by Nico and Kira.</p>");
});

module.exports = router;
