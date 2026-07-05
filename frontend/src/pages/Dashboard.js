import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import BottomNav from "../components/BottomNav";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

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
    loadAppointmentReminder();
  }, []);

  // ===========================
  // Appointment Reminder
  // ===========================

  const loadAppointmentReminder = async () => {
    try {
      setLoadingReminder(true);

      const res = await API.get("/appointments/my");

      if (!res.data || res.data.length === 0) {
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
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        })[0];

      if (!upcoming) {
        setShowReminder(false);
        return;
      }

      setAppointment(upcoming);

      const appointmentDate = new Date(upcoming.date);
      appointmentDate.setHours(0, 0, 0, 0);

      const diff =
        appointmentDate.getTime() -
        today.getTime();

      const days = Math.floor(
        diff / (1000 * 60 * 60 * 24)
      );

      setDaysUntil(days);

      if (days >= 0 && days <= 7) {
        setShowReminder(true);
      } else {
        setShowReminder(false);
      }
    } catch (err) {
      console.error(
        "Failed to load appointments",
        err
      );
    } finally {
      setLoadingReminder(false);
    }
  };

  // ===========================
  // Format Date
  // ===========================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ===========================
  // Greeting
  // ===========================

  const getGreeting = () => {
    const hour = now.getHours();

    if (hour < 12)
      return "☀️ Good Morning,";

    if (hour < 18)
      return "🌤 Good Afternoon,";

    return "🌙 Good Evening,";
  };

  // ===========================
  // Countdown Text
  // ===========================

  const getCountdownText = () => {
    if (daysUntil === null) return "";

    if (daysUntil === 0)
      return "Today's Appointment";

    if (daysUntil === 1)
      return "Tomorrow's Appointment";

    return `In ${daysUntil} days`;
  };

  // ===========================
  // Reminder Color
  // ===========================

  const getReminderColor = () => {
    if (daysUntil === 0)
      return "#DC2626";

    if (daysUntil === 1)
      return "#7C3AED";

    return "#2563EB";
  };

  // ===========================
  // Features
  // ===========================

  const features = [
    {
      title: "Mood Tracker",
      subtitle: "Track your daily mood",
      icon: "😊",
      path: "/mood",
      bg: "#FFF3D6",
    },
    {
      title: "Assessment",
      subtitle: "Mental health test",
      icon: "📝",
      path: "/assessment",
      bg: "#EFE3FF",
    },
    {
      title: "Counselor",
      subtitle: "Book a counselor",
      icon: "👩‍⚕️",
      path: "/counselor",
      bg: "#DFF8EA",
    },
    {
      title: "Appointments",
      subtitle: "Manage sessions",
      icon: "📅",
      path: "/appointments",
      bg: "#FFE4EC",
    },
    {
      title: "Calm Videos",
      subtitle: "Relax your mind",
      icon: "🎥",
      path: "/calm-videos",
      bg: "#ECE6FF",
    },
    {
      title: "Music",
      subtitle: "Peaceful music",
      icon: "🎵",
      path: "/music",
      bg: "#DCEFFF",
    },
    {
      title: "Emergency",
      subtitle: "Need urgent help",
      icon: "🚨",
      path: "/emergency",
      bg: "#FFE2E2",
    },
    {
      title: "AI Chatbot",
      subtitle: "Talk with AI",
      icon: "🤖",
      path: "/chatbot",
      bg: "#DFFAF6",
    },
  ];
return (
  <div className="dashboard-container">

    {/* Booking Success Toast */}
    {bookingToast && (
      <div className="success-toast">
        <div className="toast-icon">✅</div>

        <div>
          <h4>Appointment Booked!</h4>

          <p>
            {bookingToast.counselor}
            <br />
            {bookingToast.date} • {bookingToast.time}
          </p>
        </div>
      </div>
    )}

    {/* Header */}

    <div className="dashboard-top">

      <div>

        <h1 className="dashboard-title">
          {getGreeting()}
          <br />
          {user?.name || "User"} 👋
        </h1>

        <p className="dashboard-subtitle">
          Take care of your mental wellbeing today.
        </p>

      </div>

      <div className="dashboard-actions">

        <button
          className="notification-btn"
          onClick={() => navigate("/appointments")}
        >

          🔔

          {showReminder && (
            <span className="notification-badge">
              {daysUntil === 0 ? "!" : daysUntil}
            </span>
          )}

        </button>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </div>

    {/* Live Date */}

    <div className="live-card">

      <div>

        <h4>📅 Today</h4>

        <p>
          {now.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

      </div>

      <div>

        <h4>🕒 Time</h4>

        <p>
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

      </div>

    </div>

    {/* Reminder */}

    {loadingReminder ? (

      <div className="loading-card">
        Checking appointments...
      </div>

    ) : (
      showReminder &&
      appointment && (

        <div className="appointment-card">

          <button
            className="close-btn"
            onClick={() => setShowReminder(false)}
          >
            ✕
          </button>

          <div className="bell-circle">

            🔔

            <span className="bell-count">
              {daysUntil === 0 ? "!" : daysUntil}
            </span>

          </div>

          <div className="appointment-right">

            <span
              style={{
                color: getReminderColor(),
                fontWeight: 700,
              }}
            >
              {getCountdownText()}
            </span>

            <h2>
              Appointment Reminder
            </h2>

            <p>
              Counselor :
              {" "}
              {appointment.counselorId?.name}
            </p>

            <p>
              Date :
              {" "}
              {formatDate(appointment.date)}
            </p>

            <p>
              Time :
              {" "}
              {appointment.time}
            </p>

            <button
              className="view-btn"
              onClick={() =>
                navigate("/appointments")
              }
            >
              View Appointment
            </button>

          </div>

        </div>

      )
    )}

    {/* Mindful Banner */}

    <div className="mindful-card">

      <div className="mindful-left">

        <h2>
          Take a mindful moment
        </h2>

        <p>
          Track your mood, complete assessments,
          and connect with a professional counselor
          whenever you need support.
        </p>

      </div>

      <div className="mindful-image">
        🧘‍♀️
      </div>

    </div>
    {/* ===========================
        Feature Grid
    =========================== */}

    <div className="feature-grid">

      {features.map((item, index) => (

        <div
          key={index}
          className="feature-card-new"
          style={{ background: item.bg }}
          onClick={() => navigate(item.path)}
        >

          <div className="feature-icon-new">
            {item.icon}
          </div>

          <div className="feature-content">

            <h3>{item.title}</h3>

            <p>{item.subtitle}</p>

          </div>

          <div className="feature-arrow">
            →
          </div>

        </div>

      ))}

    </div>

    {/* ===========================
        Floating AI
    =========================== */}

    <button
      className="floating-ai"
      onClick={() => navigate("/chatbot")}
    >
      🤖
    </button>

    {/* ===========================
        Bottom Navigation
    =========================== */}

    <BottomNav />

  </div>
);

}

export default Dashboard;