const User = require("../Models/User");

// 1. Send Friend Request function
const sendRequest = async (req, res) => {
  const { targetUserId } = req.body; // The user who will receive the request
  const currentUserId = req.user._id; // The user who is sending the request

  try {
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).send("User not found");

    // Check if request is already sent or they are already friends
    if (
      targetUser.friendRequests.includes(currentUserId) ||
      targetUser.friends.includes(currentUserId)
    ) {
      return res
        .status(400)
        .send("Request already sent or you are already friends");
    }

    // Add current user's ID to target user's friend requests list
    targetUser.friendRequests.push(currentUserId);
    await targetUser.save();

    res.status(200).send("Friend request sent successfully!");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Accept Friend Request function
const acceptRequest = async (req, res) => {
  const { senderId } = req.body; // The user who sent the request
  const currentUserId = req.user._id; // The user who is accepting the request

  try {
    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    // Check if there is actually a request from this user
    if (!currentUser.friendRequests.includes(senderId)) {
      return res.status(400).send("No request found from this user");
    }

    // Remove from request list and add to each other's friends list
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== senderId.toString(),
    );
    currentUser.friends.push(senderId);
    senderUser.friends.push(currentUserId);

    await currentUser.save();
    await senderUser.save();

    res.status(200).send("Friend request accepted!");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get all pending friend requests for the logged-in user
const getPendingRequests = async (req, res) => {
  try {
    // Populate will fetch the actual user details (name, email, pic) using their IDs
    const currentUser = await User.findById(req.user._id).populate(
      "friendRequests",
      "name email pic",
    );
    res.status(200).json(currentUser.friendRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get the current user's friends list
const getFriends = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    res.status(200).json(currentUser.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendRequest, acceptRequest, getPendingRequests, getFriends };
