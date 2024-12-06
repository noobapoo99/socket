import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT; // Default to 4000 if PORT is not specified in the environment

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL, // Access the CLIENT_URL variable
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
