import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const GroupChatModal = ({ isOpen, onClose }) => {
  const { user, chats, setChats } = useContext(AuthContext);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // If modal is not open, don't show anything
  if (!isOpen) return null;

  // Search users from backend
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${query}`,
        config,
      );
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Add user to selected list (Chips)
  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      alert("User is already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  // Remove user from selected list
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  // Submit and create Group
  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      alert("Please enter a group name and add at least 2 users!");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config,
      );

      // Update chat list with new group and close modal
      setChats([data, ...chats]);
      onClose();
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchResults([]);
    } catch (error) {
      console.error(error);
      alert("Failed to Create the Chat!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] md:w-[400px] p-6 rounded-xl shadow-lg flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-lg"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Create Group Chat
        </h2>

        <input
          type="text"
          placeholder="Group Chat Name"
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={groupChatName}
          onChange={(e) => setGroupChatName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Add Users (eg: Aastha, Gautam...)"
          className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleSearch(e.target.value)}
        />

        {/* Selected Users Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedUsers.map((u) => (
            <span
              key={u._id}
              className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {u.name}
              <button
                onClick={() => handleDelete(u)}
                className="text-white hover:text-red-300 font-bold"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Search Results Display */}
        {loading ? (
          <div className="text-center text-gray-500 my-2">Loading...</div>
        ) : (
          <div className="max-h-40 overflow-y-auto mb-4">
            {searchResults?.slice(0, 4).map((searchUser) => (
              <div
                key={searchUser._id}
                onClick={() => handleGroup(searchUser)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded-lg mb-1"
              >
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center font-bold">
                  {searchUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {searchUser.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition"
        >
          Create Chat
        </button>
      </div>
    </div>
  );
};

export default GroupChatModal;
