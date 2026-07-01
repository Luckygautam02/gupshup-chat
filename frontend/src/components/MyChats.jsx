import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import GroupChatModal from "./GroupChatModal";

const MyChats = () => {
  const { user, selectedChat, setSelectedChat, chats, setChats } =
    useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch all chats of the logged-in user from backend
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/chat",
        config,
      );
      setChats(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch chats when the component loads
  useEffect(() => {
    if (user) {
      fetchChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Helper function to get the name of the other user in a 1-on-1 chat
  const getSenderName = (loggedUser, users) => {
    if (!users || users.length < 2) return "Unknown";
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
  };

  return (
    <div
      className={`w-full md:w-[30%] bg-white rounded-xl shadow-sm flex flex-col p-4 border border-gray-100 ${selectedChat ? "hidden md:flex" : "flex"}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Chats</h2>
        {/* + New Group Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition"
        >
          + New Group
        </button>
      </div>

      {/* Chat List Display */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 rounded-lg cursor-pointer transition flex items-center gap-3 ${
                selectedChat?._id === chat._id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex justify-center items-center font-bold ${
                  selectedChat?._id === chat._id
                    ? "bg-white text-blue-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {/* Check if it's a group chat to show correct initial */}
                {chat.isGroupChat
                  ? chat.chatName.charAt(0).toUpperCase()
                  : getSenderName(user, chat.users).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {/* Check if it's a group chat to show correct name */}
                  {chat.isGroupChat
                    ? chat.chatName
                    : getSenderName(user, chat.users)}
                </p>
                {chat.latestMessage && (
                  <p
                    className={`text-xs truncate ${selectedChat?._id === chat._id ? "text-blue-100" : "text-gray-500"}`}
                  >
                    {chat.latestMessage.content}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
            <span className="text-gray-400 font-medium text-sm">
              No chats available
            </span>
          </div>
        )}
      </div>

      {/* Group Chat Modal Logic Mounted Here */}
      <GroupChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MyChats;
