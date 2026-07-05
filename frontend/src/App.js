import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/main.css";

// Public Pages
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Register from "./pages/Register";

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

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {/* app-shell + app-screen lock every page to a fixed mobile width,
          regardless of the actual browser window size */}
      <div className="app-shell">
        <div className="app-screen">
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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