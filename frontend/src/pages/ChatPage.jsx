import SideDrawer from "../components/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  return (
    <div className="w-full min-h-screen bg-blue-50/50">
      {/* Top Navigation Bar */}
      <SideDrawer />

      {/* Main Layout Container */}
      <div className="flex justify-between w-full h-[calc(100vh-64px)] p-4 max-w-7xl mx-auto gap-4">
        <MyChats />
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatPage;
