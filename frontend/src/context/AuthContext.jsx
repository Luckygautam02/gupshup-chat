import { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  });

  // New states for managing chats
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);

  const logout = () => {
    // Clear all data on logout
    localStorage.removeItem("userInfo");
    setUser(null);
    setSelectedChat(null);
    setChats([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
