import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import API from "../api/axios";
import BottomNav from "../components/BottomNav";
import { ThemeContext } from "../context/ThemeContext";

import "./Dashboard.css";

// ============================================================
// ASSETS
// ============================================================

import mindfulImg from "../assets/Mindful banner.jpeg";
import moodImg from "../assets/Mood Tracker.jpeg";
import assessmentImg from "../assets/Assessment.jpeg";
import counselorImg from "../assets/Counselor.jpeg";
import appointmentsImg from "../assets/Appointments.jpeg";
import calmImg from "../assets/Calm Videos.jpeg";
import musicImg from "../assets/Music.jpeg";
import emergencyImg from "../assets/Emergency.jpeg";
import aiImg from "../assets/AI Chatbot.jpeg";
import meditationImg from "../assets/Meditation.jpeg";
import bellImg from "../assets/bell.jpeg";
import summaryImg from "../assets/summary.jpeg";
import medicationImg from "../assets/Medication.jpeg";

// NEW IMAGES
import mindRelaxGamesImg from "../assets/MindRelaxGames.jpeg";
import meditationCentersImg from "../assets/MeditationCenters.jpeg";

// ============================================================
// HELPERS
// ============================================================

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const MOOD_EMOJIS = {
  Happy: "😊",
  Calm: "😌",
  Neutral: "😐",
  Sad: "😢",
  Angry: "😠",
  Anxious: "😰",
  Tired: "😴",
};

const MAX_RATING = 5;

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getStoredUser();

  // ==========================================================
  // Theme
  // ==========================================================

  const { theme, toggleTheme } = useContext(ThemeContext);

  // ==========================================================
  // Reminder States
  // ==========================================================

  const [showReminder, setShowReminder] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [loadingReminder, setLoadingReminder] = useState(true);
  const [daysUntil, setDaysUntil] = useState(null);

  // ==========================================================
  // Live Clock
  // ==========================================================

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================================
  // Booking Success Toast
  // ==========================================================

  const [bookingToast, setBookingToast] = useState(null);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setBookingToast({
        counselor: location.state.counselorName,
        date: location.state.date,
        time: location.state.time,
      });

      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setBookingToast(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // ==========================================================
  // Mood Summary
  // ==========================================================

  const [mood, setMood] = useState(null);

  // ==========================================================
  // Logout
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================================
  // Load Dashboard Data
  // ==========================================================

  useEffect(() => {
    let ignore = false;

    // --------------------------------------------------------
    // Appointment Reminder
    // --------------------------------------------------------

    const loadAppointmentReminder = async () => {
      try {
        setLoadingReminder(true);

        const res = await API.get("/appointments/my");

        if (ignore) return;

        if (!Array.isArray(res.data) || res.data.length === 0) {
          setShowReminder(false);
          setAppointment(null);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = res.data
          .filter((item) => {
            if (item.status === "Cancelled") return false;

            const appointmentDate = new Date(item.date);
            appointmentDate.setHours(0, 0, 0, 0);

            return appointmentDate >= today;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        if (!upcoming) {
          setShowReminder(false);
          setAppointment(null);
          return;
        }

        setAppointment(upcoming);

        const appointmentDate = new Date(upcoming.date);
        appointmentDate.setHours(0, 0, 0, 0);

        const days = Math.round(
          (appointmentDate.getTime() - today.getTime()) / MS_PER_DAY
        );

        setDaysUntil(days);
        setShowReminder(days >= 0 && days <= 7);
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load appointments", err);
        }
      } finally {
        if (!ignore) {
          setLoadingReminder(false);
        }
      }
    };

    // --------------------------------------------------------
    // Latest Mood
    // --------------------------------------------------------

    const loadLatestMood = async () => {
      try {
        const res = await API.get("/moods/latest");

        if (ignore) return;

        if (!res.data) {
          setMood(null);
          return;
        }

        setMood({
          emoji: MOOD_EMOJIS[res.data.mood] || "🙂",
          label: res.data.mood || "Unknown",
          description: res.data.note || "No note added.",
          score: res.data.rating ?? 0,
          maxScore: MAX_RATING,
        });
      } catch (err) {
        if (ignore) return;

        if (err.response?.status === 404) {
          setMood(null);
        } else {
          console.error("Failed to load mood", err);
        }
      }
    };

    loadAppointmentReminder();
    loadLatestMood();

    return () => {
      ignore = true;
    };
  }, []);

  // ==========================================================
  // Format Date
  // ==========================================================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ==========================================================
  // Greeting
  // ==========================================================

  const getGreeting = () => {
    const hour = now.getHours();

    if (hour < 12) return "☀️ Good Morning,";
    if (hour < 18) return "🌤 Good Afternoon,";

    return "🌙 Good Evening,";
  };

  // ==========================================================
  // Appointment Countdown
  // ==========================================================

  const getCountdownText = () => {
    if (daysUntil === null) return "";

    if (daysUntil === 0) return "Today's Appointment";
    if (daysUntil === 1) return "Tomorrow's Appointment";

    return `In ${daysUntil} days`;
  };

  // ==========================================================
  // Reminder Color
  // ==========================================================

  const getReminderColor = () => {
    if (daysUntil === 0) return "#DC2626";
    if (daysUntil === 1) return "#7C3AED";

    return "#2563EB";
  };

  // ==========================================================
  // Mood Progress
  // ==========================================================

  const moodPercent =
    mood && mood.maxScore > 0
      ? Math.min(
          100,
          Math.max(0, (mood.score / mood.maxScore) * 100)
        )
      : 0;

  // ==========================================================
  // FEATURES
  // ==========================================================

  const features = [
    // 1. Mood Tracker
    {
      title: "Mood Tracker",
      subtitle: "Track your daily mood",
      icon: moodImg,
      path: "/mood",
      bg: "#FFF3D6",
    },

    // 2. Breathing Practice
    {
      title: "Breathing Practice",
      subtitle: "Guided breathing & mindfulness",
      icon: meditationImg,
      path: "/breathing",
      bg: "#E3F5F2",
    },

    // 3. Assessments
    {
      title: "Assessments",
      subtitle: "Mental health tests",
      icon: assessmentImg,
      path: "/assessment",
      bg: "#EFE3FF",
    },

    // 4. Mind Relax Games - NEW IMAGE
    {
      title: "Mind Relax Games",
      subtitle: "Anti-stress & fun games",
      icon: mindRelaxGamesImg,
      path: "/mind-relax-games",
      bg: "#FFF8D9",
    },

    // 5. Journal
    {
      title: "Journal",
      subtitle: "Write your thoughts & reflections",
      icon: summaryImg,
      path: "/journal",
      bg: "#FFE4EC",
    },

    // 6. Music
    {
      title: "Music",
      subtitle: "Peaceful music",
      icon: musicImg,
      path: "/music",
      bg: "#E3F2FD",
    },

    // 7. Videos
    {
      title: "Videos",
      subtitle: "Relax your mind",
      icon: calmImg,
      path: "/calm-videos",
      bg: "#ECE6FF",
    },

    // 8. Meditation Centers - NEW IMAGE
    {
      title: "Meditation Centers",
      subtitle: "Find peaceful spaces near you",
      icon: meditationCentersImg,
      path: "/meditation-centers",
      bg: "#E4F5FF",
    },

    // 9. Counselors
    {
      title: "Counselors",
      subtitle: "Book a counselor",
      icon: counselorImg,
      path: "/counselor",
      bg: "#DFF8EA",
    },

    // 10. Appointments
    {
      title: "Appointments",
      subtitle: "Manage sessions",
      icon: appointmentsImg,
      path: "/appointments",
      bg: "#FFE4EC",
    },

    // 11. Medication
    {
      title: "Medication",
      subtitle: "Track medicines & reminders",
      icon: medicationImg,
      path: "/medication",
      bg: "#E8F5E9",
    },

    // 12. Emergency
    {
      title: "Emergency",
      subtitle: "Helpline support",
      icon: emergencyImg,
      path: "/emergency",
      bg: "#FFEBEE",
    },
  ];

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="dashboard-container">

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div className="dashboard-top">
        <div>
          <h1 className="dashboard-title">
            {getGreeting()} <br />
            {user?.name || "Friend"}
          </h1>

          <p className="dashboard-subtitle">
            How are you feeling today?
          </p>
        </div>

        <div className="dashboard-actions">
          <div className="action-row">

            {/* Dark / Light Mode */}

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Notifications */}

            <button
              className="notification-btn"
              onClick={() => navigate("/notifications")}
              title="View Notifications"
            >
              <img
                src={bellImg}
                alt="Notifications"
                className="notification-img"
              />
            </button>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ======================================================
          BOOKING SUCCESS NOTIFICATION
      ====================================================== */}

      {bookingToast && (
        <div className="success-toast">
          <span className="toast-icon">✅</span>

          <div>
            <h4>Appointment Confirmed!</h4>

            <p>
              With {bookingToast.counselor} on{" "}
              {bookingToast.date} at {bookingToast.time}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          UPCOMING APPOINTMENT
      ====================================================== */}

      {!loadingReminder && showReminder && appointment && (
        <div className="appointment-card">
          <button
            className="close-btn"
            onClick={() => setShowReminder(false)}
          >
            ✕
          </button>

          <div className="bell-circle">
            <img
              src={bellImg}
              alt="Bell"
              className="bell-img"
            />

            <span className="bell-count">1</span>
          </div>

          <div className="appointment-right">
            <span
              style={{
                color: getReminderColor(),
                fontWeight: 700,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {getCountdownText()}
            </span>

            <h2>Upcoming Session</h2>

            <p>
              <strong>Counselor:</strong>{" "}
              {appointment.counselorName}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {formatDate(appointment.date)}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {appointment.time}
            </p>

            <button
              className="view-btn"
              onClick={() => navigate("/appointments")}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          MINDFULNESS BANNER
      ====================================================== */}

      <div className="mindful-card">
        <div className="mindful-left">
          <h2>Daily Mindfulness</h2>

          <p>
            Take a deep breath. Focus on the present moment and
            care for your mind.
          </p>
        </div>

        <div className="mindful-image">
          <img
            src={mindfulImg}
            alt="Mindfulness"
            className="mindful-img"
          />
        </div>
      </div>

      {/* ======================================================
          LATEST MOOD
      ====================================================== */}

      <div className="summary-section">
        <div className="summary-header">
          <h2>Latest Mood Log</h2>

          <button
            className="history-btn"
            onClick={() => navigate("/mood")}
          >
            History &gt;
          </button>
        </div>

        {mood ? (
          <div className="summary-card">
            <div className="summary-left">
              <div className="summary-emoji">
                {mood.emoji}
              </div>

              <div>
                <p className="summary-label">
                  Status
                </p>

                <h3>{mood.label}</h3>

                <span>
                  {mood.description}
                </span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-right">
              <p className="summary-label">
                Intensity
              </p>

              <h2>
                {mood.score} / {mood.maxScore}
              </h2>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${moodPercent}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="summary-card"
            style={{
              cursor: "pointer",
            }}
            onClick={() => navigate("/mood")}
          >
            <div className="summary-left">
              <div className="summary-emoji">
                <img
                  src={summaryImg}
                  alt="Summary"
                  className="summary-img"
                />
              </div>

              <div>
                <h3>No mood logged yet</h3>

                <span>
                  Click here to track your mood today!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          FEATURE NAVIGATION GRID

          1. Mood Tracker
          2. Breathing Practice
          3. Assessments
          4. Mind Relax Games
          5. Journal
          6. Music
          7. Videos
          8. Meditation Centers
          9. Counselors
          10. Appointments
          11. Medication
          12. Emergency
      ====================================================== */}

      <div className="feature-grid">
        {features.map((item, index) => (
          <div
            key={index}
            className="feature-card-new"
            onClick={() => navigate(item.path)}
          >
            <div
              className="feature-icon-new"
              style={{
                backgroundColor: item.bg,
              }}
            >
              <img
                src={item.icon}
                alt={item.title}
                className="feature-img"
              />
            </div>

            <div className="feature-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>

            <span className="feature-arrow">
              &rsaquo;
            </span>
          </div>
        ))}
      </div>

      {/* ======================================================
          FLOATING AI CHATBOT BUTTON
      ====================================================== */}

      <button
        className="floating-ai"
        onClick={() => navigate("/chatbot")}
        title="AI Mental Health Companion"
      >
        <img
          src={aiImg}
          alt="AI Assistant"
          className="floating-ai-img"
        />
      </button>

      {/* ======================================================
          BOTTOM NAVIGATION
      ====================================================== */}

      <BottomNav />
    </div>
  );
}

export default Dashboard;