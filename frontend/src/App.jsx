import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/ChatPage";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  // Check if user is logged in by looking for data in localStorage
  const user = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <>
      <SpeedInsights />
      <Router>
        <Routes>
          {/* Redirect to chats if the user is already logged in */}
          <Route
            path="/login"
            element={user ? <Navigate to="/chats" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/chats" /> : <Signup />}
          />

          {/* Protected Chat Route: Redirect to login if NOT logged in */}
          <Route
            path="/chats"
            element={user ? <ChatPage /> : <Navigate to="/login" />}
          />

          {/* Default route redirects to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
