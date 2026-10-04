import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import "./styles/main.css";

// Public Pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Assessment from "./pages/Assessment";
import Counselor from "./pages/Counselor";
import Appointments from "./pages/Appointments";
import CalmVideos from "./pages/CalmVideos";
import Music from "./pages/Music";
import Meditation from "./pages/Meditation";
import Chatbot from "./pages/Chatbot";
import Emergency from "./pages/Emergency";
import Profile from "./pages/Profile";

import Journal from "./pages/Journal";
import Notifications from "./pages/Notifications";
import MeditationCenters from "./pages/MeditationCenters";

// Components
import NotificationBell from "./components/NotificationBell";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <BrowserRouter>
      {/* Dynamic theme class for app shell */}
      <div className={`app-shell ${theme}`}>
        <div className="app-screen">
          <NotificationBell />
          <Routes>
            <Route
              path="/breathing"
              element={
                <ProtectedRoute>
                  <Meditation breathing />
                </ProtectedRoute>
              }
            />
            {[
              ["/journal", Journal],
              ["/notifications", Notifications],
              ["/meditation-centers", MeditationCenters],
            ].map(([path, Page]) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Page />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Public Routes */}
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mood"
              element={
                <ProtectedRoute>
                  <MoodTracker />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <Assessment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/counselor"
              element={
                <ProtectedRoute>
                  <Counselor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/calm-videos"
              element={
                <ProtectedRoute>
                  <CalmVideos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/music"
              element={
                <ProtectedRoute>
                  <Music />
                </ProtectedRoute>
              }
            />

            <Route
              path="/meditation"
              element={
                <ProtectedRoute>
                  <Meditation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />

            <Route
              path="/emergency"
              element={
                <ProtectedRoute>
                  <Emergency />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
