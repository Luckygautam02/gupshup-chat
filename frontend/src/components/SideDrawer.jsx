import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SideDrawer = () => {
  // Added setSelectedChat, chats, and setChats to Context to open chat directly
  const { user, setSelectedChat, chats, setChats } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // NEW STATE: To store the current user's friends list
  const [myFriends, setMyFriends] = useState([]);

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        "https://gupshup-chat-jpxe.onrender.com/api/user/requests",
        config,
      );
      setPendingRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  // NEW FUNCTION: Fetch friends list
  const fetchFriends = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        "https://gupshup-chat-jpxe.onrender.com/api/user/friends",
        config,
      );
      setMyFriends(data); // Stores array of friend IDs
    } catch (error) {
      console.error("Failed to fetch friends", error);
    }
  };

  // Run on load
  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      fetchFriends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Search users
  const handleSearch = async () => {
    if (!search) {
      toast.warning("Please enter a name or email to search!");
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `https://gupshup-chat-jpxe.onrender.com/api/user?search=${search}`,
        config,
      );
      setLoading(false);
      setSearchResults(data);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to load search results!");
    }
  };

  // Send friend request
  const handleSendRequest = async (targetUserId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        "https://gupshup-chat-jpxe.onrender.com/api/user/send-request",
        { targetUserId },
        config,
      );
      toast.success("Friend request sent successfully!");
    } catch (error) {
      toast.error(error.response?.data || "Failed to send request.");
    }
  };

  // Accept request
  const handleAcceptRequest = async (senderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        "https://gupshup-chat-jpxe.onrender.com/api/user/accept-request",
        { senderId },
        config,
      );

      toast.success("Request accepted! You are now friends.");
      setPendingRequests(pendingRequests.filter((req) => req._id !== senderId));
      if (pendingRequests.length === 1) setShowNotifications(false);

      // Update friends list immediately so UI changes
      fetchFriends();
    } catch (error) {
      toast.error("Failed to accept request.");
    }
  };

  // NEW FUNCTION: Create or open 1-on-1 chat with a friend
  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `https://gupshup-chat-jpxe.onrender.com/api/chat`,
        { userId },
        config,
      );

      // If chat is not already in the list, add it
      if (chats && !chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setIsOpen(false); // Close the drawer
    } catch (error) {
      toast.error("Error fetching the chat");
    }
  };

  return (
    <>
      {/* 1. TOP NAVBAR */}
      <div className="flex justify-between items-center bg-white w-full p-3 border-b shadow-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition border border-gray-200"
        >
          🔍 <span className="hidden md:flex">Search User</span>
        </button>

        <h1 className="text-2xl font-extrabold text-blue-600">Chat App</h1>

        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-2xl text-gray-600 hover:text-blue-600 transition relative mt-1"
            >
              🔔
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                <h3 className="font-bold text-gray-800 p-3 border-b bg-gray-50 rounded-t-xl">
                  Friend Requests
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  {pendingRequests.length === 0 ? (
                    <p className="p-4 text-center text-gray-500 text-sm">
                      No new requests
                    </p>
                  ) : (
                    pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold text-sm">
                            {req.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {req.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Accept
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* 2. SIDE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col transition-transform transform translate-x-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Search Users</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-red-500 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex gap-2 border-b">
              <input
                type="text"
                placeholder="Search by name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Go
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-gray-500 mt-5">
                  Loading users...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((searchedUser) => (
                  <div
                    key={searchedUser._id}
                    className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 hover:bg-gray-100 p-3 rounded-xl mb-3 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold text-lg">
                        {searchedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {searchedUser.name}
                        </p>
                      </div>
                    </div>

                    {/* SMART BUTTON LOGIC: If they are friends, show Message button, else show Request button */}
                    {myFriends.includes(searchedUser._id) ? (
                      <button
                        onClick={() => accessChat(searchedUser._id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(searchedUser._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        Request
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 mt-5 italic">
                  Search to find users.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
      />
    </>
  );
};

export default SideDrawer;
