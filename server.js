const app = require("./app");
const http = require("http").Server(app)
const {Server} = require("socket.io")

const FRONTEND_URL = process.env.ORIGIN || "http://localhost:3000";

const io = new Server(http, {cors: {origin:[FRONTEND_URL]}})
// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 5005
const PORT = process.env.PORT || 5005;

http.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

io.on('connection', (socket) => {
  console.log("HEY, welcome to the chat.")

  socket.on("disconnect", () => {
    console.log("BYE, see u soon.")
  })

  socket.on("send", (data) => {
    const {chat} = data
    io.in(chat).emit("send", data)
    console.log("Client has sent us: ", data)
  })

  socket.on("join", (chatId) => {
    socket.join(chatId)
    console.log("ChatId: ", chatId)
    console.log("-- room??? --- ", socket.rooms)
  })
})