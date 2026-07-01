const express = require("express");
const { allUsers } = require("../Controllers/userController");
const { protect } = require("../Middleware/authMiddleware");
const {
  sendRequest,
  acceptRequest,
  getPendingRequests,
  getFriends,
} = require("../Controllers/requestController");

const router = express.Router();

// Route to search users (Protected so only logged-in users can search)
router.get("/", protect, allUsers);
router.post("/send-request", protect, sendRequest);
router.post("/accept-request", protect, acceptRequest);
router.get("/requests", protect, getPendingRequests);
router.get("/friends", protect, getFriends);

module.exports = router;
