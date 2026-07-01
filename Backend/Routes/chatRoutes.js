const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  deleteChat,
} = require("../Controllers/chatController");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);

// Route to remove user from group
router.put("/groupremove", protect, removeFromGroup);

// Route to delete entire chat
router.delete("/:chatId", protect, deleteChat);

module.exports = router;
