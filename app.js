import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const PORT = process.env.PORT;

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"], // Specify allowed HTTP methods
    credentials: true, // Allow cookies to be sent if necessary
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
