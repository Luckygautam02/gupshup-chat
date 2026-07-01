const Message = require("../Models/Message");
const User = require("../Models/User");
const Chat = require("../Models/Chat");

// Function to send a new message
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res
      .status(400)
      .json({ message: "Invalid data passed into request" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    // Create and save the new message
    var message = await Message.create(newMessage);

    // Populate necessary fields
    message = await message.populate("sender", "name");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    // Update the latest message in the chat model
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to fetch all messages for a specific chat
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages, deleteMessage };
