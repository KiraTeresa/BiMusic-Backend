const app = require("./app");
const http = require("http").Server(app)
const {Server} = require("socket.io")

const FRONTEND_URL = process.env.ORIGIN || "http://localhost:3000";

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 5005
const PORT = process.env.PORT || 5005;

http.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


// Socket Server
const io = new Server(http, {cors: {origin:[FRONTEND_URL]}})

io.on('connection', (socket) => {
  console.log("HEY, welcome to the chat.")

  socket.on("disconnect", () => {
    console.log("BYE, see you soon.")
  })

  socket.on("send", (data) => {
    const {chat} = data
    io.sockets.in(`room-${chat}`).emit("send", data)
    console.log("Client has sent us: ", data)
  })

  socket.on("join", (room) => {
    socket.join(room)
    // console.log("room: ", room)
    // console.log("-- rooms --- ", socket.rooms)
  })
})