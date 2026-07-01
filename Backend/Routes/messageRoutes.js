const express = require("express");
const {
  sendMessage,
  allMessages,
  deleteMessage,
} = require("../Controllers/messageController");
const { protect } = require("../Middleware/authMiddleware"); // Check if path is correct

const router = express.Router();

// Route to send a new message
router.post("/", protect, sendMessage);

// Route to fetch all messages of a specific chat
router.get("/:chatId", protect, allMessages);

router.delete("/:messageId", protect, deleteMessage);

module.exports = router;
