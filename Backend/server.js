const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./Routes/authRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const userRoutes = require("./Routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Middleware
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Chat application backend is running smoothly!");
});

// Create HTTP Server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // Default Vite+React port for frontend
    methods: ["GET", "POST"],
  },
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log("Connected to socket.io successfully");

  // User connects and creates their own private room
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`User registered in socket room: ${userData._id}`);
    socket.emit("connected");
  });

  // User enters a specific chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined chat room: ${room}`);
  });

  // Real-time message broadcasting logic
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    // Send message to all users in the chat except the sender
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Handle socket disconnection
  socket.off("setup", () => {
    console.log("User disconnected from socket");
    socket.leave(userData._id);
  });
});

// MongoDB Connection and Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connection successful! ");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
  });
