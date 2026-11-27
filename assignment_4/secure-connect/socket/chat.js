// Real-time chat with Socket.IO. Sockets must present a valid JWT to connect.
const jwt = require("jsonwebtoken");
const appEvents = require("../events/appEvents");

function initChat(io) {
  // Authenticate the socket handshake: io(url, { auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (room = "general") => {
      socket.join(room);
      socket.data.room = room;
      console.log(`${socket.id} joined room ${room}`);
      socket.to(room).emit("notification", `${socket.user.username} joined ${room}`);
    });

    socket.on("chatMessage", ({ room, text } = {}) => {
      room = room || socket.data.room || "general";
      if (!text || !text.trim()) return;

      const message = {
        room,
        username: socket.user.username,
        text: text.trim(),
        time: new Date().toISOString(),
      };
      appEvents.emit("chat:message", message); // logs "[room] user: text"
      io.to(room).emit("chatMessage", message);
    });

    socket.on("typing", (room) => {
      socket.to(room || socket.data.room).emit("typing", socket.user.username);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.data.room) {
        socket.to(socket.data.room).emit("notification", `${socket.user.username} left the chat`);
      }
    });
  });
}

module.exports = initChat;
