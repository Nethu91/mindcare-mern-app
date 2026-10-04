import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import BottomNav from "../components/BottomNav";
import { ThemeContext } from "../context/ThemeContext";
import "./Dashboard.css";

// Asset imports match the exact file names and extensions in src/assets/
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

// Safely read the logged-in user (avoids a crash if localStorage is empty/corrupt)
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Emoji for each mood name saved by the Mood page (keys must match exactly)
const MOOD_EMOJIS = {
  Happy: "😊",
  Calm: "😌",
  Neutral: "😐",
  Sad: "😢",
  Angry: "😠",
  Anxious: "😰",
  Tired: "😴",
};

// Change to 10 if your Mood page saves ratings out of 10
const MAX_RATING = 5;

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getStoredUser();

  // ===========================
  // Theme (light / dark)
  // ===========================
  const { theme, toggleTheme } = useContext(ThemeContext);

  // ===========================
  // Reminder States
  // ===========================
  const [showReminder, setShowReminder] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [loadingReminder, setLoadingReminder] = useState(true);
  const [daysUntil, setDaysUntil] = useState(null);

  // ===========================
  // Live Clock
  // ===========================
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ===========================
  // Booking Success Toast
  // ===========================
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

  // ===========================
  // Mood Summary
  // null = user has not logged a mood yet
  // ===========================
  const [mood, setMood] = useState(null);

  // ===========================
  // Logout
  // ===========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ===========================
  // Load Dashboard Data
  // ===========================
  useEffect(() => {
    let ignore = false;

    // ---------- Appointment Reminder ----------
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

        // Math.round handles daylight-saving shifts correctly
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
        if (!ignore) setLoadingReminder(false);
      }
    };

    // ---------- Latest Mood ----------
    const loadLatestMood = async () => {
      try {
        const res = await API.get("/moods/latest");
        if (ignore) return;

        // Backend may return 200 with null when there is no mood yet
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

        // 404 just means "no mood logged yet" -> not a real error
        if (err.response?.status === 404) {
          setMood(null);
        } else {
          console.error("Failed to load mood", err);
        }
      }
    };

    loadAppointmentReminder();
    loadLatestMood();

    // Cleanup: stops state updates after unmount / StrictMode re-run
    return () => {
      ignore = true;
    };
  }, []);

  // ===========================
  // Format Date
  // ===========================
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ===========================
  // Greeting
  // ===========================
  const getGreeting = () => {
    const hour = now.getHours();

    if (hour < 12) return "☀️ Good Morning,";
    if (hour < 18) return "🌤 Good Afternoon,";

    return "🌙 Good Evening,";
  };

  // ===========================
  // Countdown Text
  // ===========================
  const getCountdownText = () => {
    if (daysUntil === null) return "";

    if (daysUntil === 0) return "Today's Appointment";
    if (daysUntil === 1) return "Tomorrow's Appointment";

    return `In ${daysUntil} days`;
  };

  // ===========================
  // Reminder Color
  // ===========================
  const getReminderColor = () => {
    if (daysUntil === 0) return "#DC2626";
    if (daysUntil === 1) return "#7C3AED";

    return "#2563EB";
  };

  // ===========================
  // Mood progress (safe against divide by zero)
  // ===========================
  const moodPercent =
    mood && mood.maxScore > 0
      ? Math.min(100, Math.max(0, (mood.score / mood.maxScore) * 100))
      : 0;

  // ===========================
  // Features
  // ===========================
  const features = [
    {title:"Breathing Practice",subtitle:"Guided breathing & mindfulness",icon:meditationImg,path:"/breathing",bg:"#E3F5F2"},
    {title:"Meditation Centers",subtitle:"Find peaceful spaces near you",icon:meditationImg,path:"/meditation-centers",bg:"#EFE3FF"},
    {title:"My Journal",subtitle:"Write your thoughts & reflections",icon:summaryImg,path:"/journal",bg:"#FFE4EC"},
    {
      title: "Mood Tracker",
      subtitle: "Track your daily mood",
      icon: moodImg,
      path: "/mood",
      bg: "#FFF3D6",
    },
    {
      title: "Assessment",
      subtitle: "Mental health test",
      icon: assessmentImg,
      path: "/assessment",
      bg: "#EFE3FF",
    },
    {
      title: "Counselor",
      subtitle: "Book a counselor",
      icon: counselorImg,
      path: "/counselor",
      bg: "#DFF8EA",
    },
    {
      title: "Appointments",
      subtitle: "Manage sessions",
      icon: appointmentsImg,
      path: "/appointments",
      bg: "#FFE4EC",
    },
    {
      title: "Calm Videos",
      subtitle: "Relax your mind",
      icon: calmImg,
      path: "/calm-videos",
      bg: "#ECE6FF",
    },
    {
      title: "Music",
      subtitle: "Peaceful music",
      icon: musicImg,
      path: "/music",
      bg: "#E3F2FD",
    },
    {
      title: "Emergency",
      subtitle: "Helpline support",
      icon: emergencyImg,
      path: "/emergency",
      bg: "#FFEBEE",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="dashboard-top">
        <div>
          <h1 className="dashboard-title">
            {getGreeting()} <br />
            {user?.name || "Friend"}
          </h1>
          <p className="dashboard-subtitle">How are you feeling today?</p>
        </div>

        <div className="dashboard-actions">
          <div className="action-row">
            {/* Dark / Light mode toggle */}
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

            <button
              className="notification-btn"
              onClick={() => navigate("/notifications")}
              title="View Appointments"
            >
              <img
                src={bellImg}
                alt="Notifications"
                className="notification-img"
              />

            </button>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Booking Success Notification */}
      {bookingToast && (
        <div className="success-toast">
          <span className="toast-icon">✅</span>
          <div>
            <h4>Appointment Confirmed!</h4>
            <p>
              With {bookingToast.counselor} on {bookingToast.date} at{" "}
              {bookingToast.time}
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Appointment Card */}
      {!loadingReminder && showReminder && appointment && (
        <div className="appointment-card">
          <button className="close-btn" onClick={() => setShowReminder(false)}>
            ✕
          </button>

          <div className="bell-circle">
            <img src={bellImg} alt="Bell" className="bell-img" />
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
              <strong>Counselor:</strong> {appointment.counselorName}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(appointment.date)}
            </p>
            <p>
              <strong>Time:</strong> {appointment.time}
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

      {/* Mindful Banner */}
      <div className="mindful-card">
        <div className="mindful-left">
          <h2>Daily Mindfulness</h2>
          <p>
            Take a deep breath. Focus on the present moment and care for your
            mind.
          </p>
        </div>
        <div className="mindful-image">
          <img src={mindfulImg} alt="Mindfulness" className="mindful-img" />
        </div>
      </div>

      {/* Latest Mood Summary */}
      <div className="summary-section">
        <div className="summary-header">
          <h2>Latest Mood Log</h2>
          <button className="history-btn" onClick={() => navigate("/mood")}>
            History &gt;
          </button>
        </div>

        {mood ? (
          <div className="summary-card">
            <div className="summary-left">
              <div className="summary-emoji">{mood.emoji}</div>
              <div>
                <p className="summary-label">Status</p>
                <h3>{mood.label}</h3>
                <span>{mood.description}</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-right">
              <p className="summary-label">Intensity</p>
              <h2>
                {mood.score} / {mood.maxScore}
              </h2>
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{ width: `${moodPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="summary-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/mood")}
          >
            <div className="summary-left">
              <div className="summary-emoji">
                <img src={summaryImg} alt="Summary" className="summary-img" />
              </div>
              <div>
                <h3>No mood logged yet</h3>
                <span>Click here to track your mood today!</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Navigation Grid */}
      <div className="feature-grid">
        {features.map((item, index) => (
          <div
            key={index}
            className="feature-card-new"
            onClick={() => navigate(item.path)}
          >
            <div
              className="feature-icon-new"
              style={{ backgroundColor: item.bg }}
            >
              <img src={item.icon} alt={item.title} className="feature-img" />
            </div>

            <div className="feature-content">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </div>

            <span className="feature-arrow">&rsaquo;</span>
          </div>
        ))}
      </div>

      {/* Floating AI Chatbot Button */}
      <button
        className="floating-ai"
        onClick={() => navigate("/chatbot")}
        title="AI Mental Health Companion"
      >
        <img src={aiImg} alt="AI Assistant" className="floating-ai-img" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default Dashboard;
