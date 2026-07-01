import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const GroupInfoModal = ({ isOpen, onClose }) => {
  // Extracting user, selectedChat, and chats state directly from Context
  const { user, selectedChat, setSelectedChat, chats, setChats } =
    useContext(AuthContext);

  if (!isOpen) return null;

  // Function to remove the current user from a group
  const handleLeaveGroup = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        "http://localhost:5000/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: user._id,
        },
        config,
      );

      // Instantly remove this group from the local chat list state
      setChats(chats.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(null);
      onClose();
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave the group!");
    }
  };

  // Function to delete the entire chat (1-on-1 or Group)
  const handleDeleteChat = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(
        `http://localhost:5000/api/chat/${selectedChat._id}`,
        config,
      );

      // Instantly remove this deleted chat from the local chat list state
      setChats(chats.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(null);
      onClose();
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete the chat!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] md:w-[300px] p-6 rounded-xl shadow-lg relative">
        <h2 className="text-lg font-bold mb-4 text-gray-800 text-center">
          Chat Settings
        </h2>

        {/* Leave Group Button - Only shows if it's a Group Chat */}
        {selectedChat.isGroupChat && (
          <button
            onClick={handleLeaveGroup}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-lg mb-3 transition"
          >
            Leave Group
          </button>
        )}

        {/* Delete Chat Button - Shows for all chats */}
        <button
          onClick={handleDeleteChat}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
        >
          Delete Chat
        </button>

        {/* Cancel Button to close the modal */}
        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-500 hover:text-gray-800 font-medium py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GroupInfoModal;
