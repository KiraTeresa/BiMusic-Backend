// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const profileRoutes = require("./routes/profile.routes");
app.use("/profile", profileRoutes);

const projectRoutes = require("./routes/projects.routes")
app.use("/projects", projectRoutes)

const samplesRoutes = require("./routes/samples.routes")
app.use("/samples", samplesRoutes)

const userRoutes = require("./routes/user.routes")
app.use("/user", userRoutes)

const commentRoutes = require("./routes/comment.routes")
app.use("/comment", commentRoutes)

const feedbackRoutes = require("./routes/feedback.routes")
app.use("/feedback", feedbackRoutes)

const chatRoutes = require("./routes/chat.routes")
app.use("/chats", chatRoutes)

const messageRoutes = require("./routes/message.routes")
app.use("/message", messageRoutes)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;