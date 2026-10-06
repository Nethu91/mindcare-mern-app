import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";
import "./styles/main.css";

// ============================================================
// PUBLIC PAGES
// ============================================================
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

// ============================================================
// PROTECTED PAGES
// ============================================================
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

// ============================================================
// ADDITIONAL PAGES
// ============================================================
import Journal from "./pages/Journal";
import Notifications from "./pages/Notifications";
import MeditationCenters from "./pages/MeditationCenters";
import MindRelaxGames from "./pages/MindRelaxGames";
import Medication from "./pages/Medication";

// ============================================================
// COMPONENTS
// ============================================================
import NotificationBell from "./components/NotificationBell";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <BrowserRouter>
      {/* Dynamic theme class for app shell */}
      <div className={`app-shell ${theme}`}>
        <div className="app-screen">
          {/* Global Notification Bell */}
          <NotificationBell />

          <Routes>
            {/* ==================================================
                PUBLIC ROUTES
            ================================================== */}

            <Route path="/" element={<Splash />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                BREATHING
            ================================================== */}

            <Route
              path="/breathing"
              element={
                <ProtectedRoute>
                  <Meditation breathing />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                MOOD TRACKER
            ================================================== */}

            <Route
              path="/mood"
              element={
                <ProtectedRoute>
                  <MoodTracker />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                ASSESSMENT
            ================================================== */}

            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <Assessment />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                COUNSELOR
            ================================================== */}

            <Route
              path="/counselor"
              element={
                <ProtectedRoute>
                  <Counselor />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                APPOINTMENTS
            ================================================== */}

            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                CALM VIDEOS
            ================================================== */}

            <Route
              path="/calm-videos"
              element={
                <ProtectedRoute>
                  <CalmVideos />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                MUSIC
            ================================================== */}

            <Route
              path="/music"
              element={
                <ProtectedRoute>
                  <Music />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                MEDITATION
            ================================================== */}

            <Route
              path="/meditation"
              element={
                <ProtectedRoute>
                  <Meditation />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                JOURNAL
            ================================================== */}

            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                NOTIFICATIONS
            ================================================== */}

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                MEDITATION CENTERS
            ================================================== */}

            <Route
              path="/meditation-centers"
              element={
                <ProtectedRoute>
                  <MeditationCenters />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                MIND RELAX GAMES
            ================================================== */}

            <Route
              path="/mind-relax-games"
              element={
                <ProtectedRoute>
                  <MindRelaxGames />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                MEDICATION
            ================================================== */}

            <Route
              path="/medication"
              element={
                <ProtectedRoute>
                  <Medication />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                AI CHATBOT
            ================================================== */}

            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                EMERGENCY
            ================================================== */}

            <Route
              path="/emergency"
              element={
                <ProtectedRoute>
                  <Emergency />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                PROFILE
            ================================================== */}

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