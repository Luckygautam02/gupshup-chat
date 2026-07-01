import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import GroupInfoModal from "./GroupInfoModal"; // Import the modal

// Backend URL where Socket.io is running
const ENDPOINT = "https://gupshup-chat-jpxe.onrender.com";
let socket;

const ChatBox = () => {
  const { user, selectedChat, setSelectedChat } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // State for the settings modal

  // Helper function to get the name of the other user in 1-on-1 chat
  const getSenderName = (loggedUser, users) => {
    if (!loggedUser || !users || users.length < 2) return "";
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  // 1. Initialize Socket.io Connection
  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  // Function to fetch all messages for the selected chat
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(
        `https://gupshup-chat-jpxe.onrender.com/api/message/${selectedChat._id}`,
        config,
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  // Listen for real-time messages from socket
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        // Notification logic could be added here
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler);
    };
  });

  // Function to send a new message
  const sendMessage = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && newMessage) {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const messageContent = newMessage;
        setNewMessage("");

        const { data } = await axios.post(
          "https://gupshup-chat-jpxe.onrender.com/api/message",
          { content: messageContent, chatId: selectedChat._id },
          config,
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Function to handle message deletion
  const deleteMessageApi = async (messageId) => {
    try {
      await axios.delete(
        `https://gupshup-chat-jpxe.onrender.com/api/message/${messageId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      // Update the state to instantly remove the deleted message from screen
      setMessages(messages.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return (
    <div
      className={`w-full md:w-[68%] bg-white rounded-xl shadow-sm flex flex-col p-4 border border-gray-100 ${selectedChat ? "flex" : "hidden md:flex items-center justify-center"}`}
    >
      {selectedChat ? (
        <>
          {/* Chat Window Header */}
          <div className="flex items-center gap-3 border-b pb-3 w-full">
            <button
              className="md:hidden text-gray-600 font-bold text-lg"
              onClick={() => setSelectedChat(null)}
            >
              ⬅ Back
            </button>
            <div className="w-10 h-10 bg-blue-600 text-white font-bold flex justify-center items-center rounded-full">
              {selectedChat.isGroupChat
                ? selectedChat.chatName.charAt(0).toUpperCase()
                : getSenderName(user, selectedChat.users)
                    .charAt(0)
                    .toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                {selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getSenderName(user, selectedChat.users)}
              </h3>
              <p className="text-xs text-green-500 font-medium">
                {selectedChat.isGroupChat
                  ? `${selectedChat.users.length} Members`
                  : socketConnected
                    ? "Online"
                    : "Connecting..."}
              </p>
            </div>

            {/* Settings/Info Button (Three dots ⋮) */}
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="ml-auto text-gray-400 hover:text-blue-600 font-bold text-xl px-2"
            >
              ⋮
            </button>
          </div>

          {/* Chat Messages Display Area */}
          <div className="flex-1 overflow-y-auto my-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
            {loading ? (
              <div className="text-center text-gray-400 mt-10">
                Loading messages...
              </div>
            ) : messages.length > 0 ? (
              messages.map((m, i) => (
                <div
                  key={m._id || i}
                  className={`flex flex-col group relative ${m.sender._id === user._id ? "items-end" : "items-start"}`}
                >
                  {/* Show sender's name above message in Group Chats */}
                  {selectedChat.isGroupChat && m.sender._id !== user._id && (
                    <span className="text-[10px] text-gray-500 ml-2 mb-0.5 font-medium">
                      {m.sender.name}
                    </span>
                  )}

                  <div className="relative max-w-[75%] flex items-center">
                    <span
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        m.sender._id === user._id
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </span>

                    {/* Delete button (Visible only on hover of your own messages) */}
                    {m.sender._id === user._id && (
                      <button
                        onClick={() => deleteMessageApi(m._id)}
                        className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 font-bold transition-opacity duration-200"
                        title="Delete Message"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm italic mt-10">
                Start the conversation!
              </div>
            )}
          </div>

          {/* Typing Input Area */}
          <div className="w-full flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={sendMessage}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <h1 className="text-3xl text-gray-300 font-light text-center">
          Click on a user to start chatting
        </h1>
      )}

      {/* Info Modal Component */}
      <GroupInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        fetchChats={fetchMessages}
      />
    </div>
  );
};

export default ChatBox;
