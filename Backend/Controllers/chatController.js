const Chat = require("../Models/Chat");
const User = require("../Models/User");

// Function to access or create a 1-on-1 chat
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "UserId param not sent with request" });
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password",
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to fetch all chats for a user
const fetchChats = async (req, res) => {
  try {
    // Find all chats where the logged-in user is part of the 'users' array
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) // Sort by latest message
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to create a new Group Chat
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  // Frontend will send users array in stringified format, so we parse it
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Add the currently logged-in user (who is creating the group) to the users array
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // Fetch the newly created group chat and populate user details
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to remove a user from a group
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // $pull removes the userId from the users array
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(removed);
  }
};

// Function to delete a chat (works for both 1-on-1 and Group)
const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  deleteChat,
};
