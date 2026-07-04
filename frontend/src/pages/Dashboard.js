import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import BottomNav from "../components/BottomNav";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // ===========================
  // Reminder States
  // ===========================

  const [showReminder, setShowReminder] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [loadingReminder, setLoadingReminder] = useState(true);
  const [daysUntil, setDaysUntil] = useState(null);

  // ===========================
  // Logout
  // ===========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ===========================
  // Load Upcoming Appointment
  // ===========================

  useEffect(() => {
    loadAppointmentReminder();
  }, []);

  const loadAppointmentReminder = async () => {
    try {
      setLoadingReminder(true);

      const res = await API.get("/appointments/my");

      console.log("Appointments Response:", res.data);

      if (!res.data || res.data.length === 0) {
        setLoadingReminder(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = res.data
        .filter((item) => {
          const appointmentDate = new Date(item.date);
          appointmentDate.setHours(0, 0, 0, 0);

          console.log("Appointment Date:", appointmentDate);
          console.log("Today:", today);

          return appointmentDate >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      console.log("Upcoming:", upcoming);

      if (!upcoming) {
        console.log("No upcoming appointments found.");
        setLoadingReminder(false);
        return;
      }

      setAppointment(upcoming);

      const appointmentDate = new Date(upcoming.date);
      appointmentDate.setHours(0, 0, 0, 0);

      const diff = appointmentDate.getTime() - today.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setDaysUntil(days);

      if (days <= 7 && days >= 0) {
        setShowReminder(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingReminder(false);
    }
  };

  // ===========================
  // Date Formatter
  // ===========================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getReminderLabel = () => {
    if (daysUntil === 0) {
      return { text: "🔴 Today's Appointment", color: "#DC2626" };
    }
    if (daysUntil === 1) {
      return { text: "🟣 Tomorrow's Appointment", color: "#7C3AED" };
    }
    return { text: "🔵 Upcoming Appointment", color: "#2563EB" };
  };

  // ===========================
  // Dashboard Features
  // ===========================

  const features = [
    { title: "Mood Tracker", icon: "😊", path: "/mood" },
    { title: "Assessment", icon: "📝", path: "/assessment" },
    { title: "Counselor", icon: "👩‍⚕️", path: "/counselor" },
    { title: "Appointments", icon: "📅", path: "/appointments" },
    { title: "Calm Videos", icon: "🎥", path: "/calm-videos" },
    { title: "Music", icon: "🎧", path: "/music" },
    { title: "Emergency", icon: "🚨", path: "/emergency" },
    { title: "AI Chatbot", icon: "🤖", path: "/chatbot" },
  ];

  return (
    <>
      <style>
        {`
          @keyframes popup {
            from {
              opacity: 0;
              transform: translateY(-25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0% { transform: rotate(0deg) }
            25% { transform: rotate(8deg) }
            50% { transform: rotate(-8deg) }
            75% { transform: rotate(8deg) }
            100% { transform: rotate(0deg) }
          }
        `}
      </style>

      <div className="mobile-container">
        <div className="dashboard-header">
          <div>
            <h2>Hello, {user?.name || "User"} 👋</h2>
            <p className="muted-text">How are you feeling today?</p>
          </div>

          <button className="small-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* 🔧 TEMPORARY DEBUG LINE — remove after testing */}
        <p>Show Reminder: {showReminder ? "YES" : "NO"}</p>

        {loadingReminder && (
          <div
            style={{
              background: "#F8F4FF",
              borderRadius: "18px",
              padding: "15px",
              textAlign: "center",
              marginBottom: "20px",
              color: "#7C3AED",
              fontWeight: "600",
            }}
          >
            ⏳ Checking your upcoming appointments...
          </div>
        )}

        {/* =========================
             Appointment Reminder
        ========================= */}

        {showReminder && appointment && (
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              borderRadius: "28px",
              padding: "20px",
              marginBottom: "20px",
              position: "relative",
              boxShadow: "0 20px 45px rgba(155,93,229,.18)",
              border: "2px solid #F7D7FF",
              overflow: "hidden",
              animation: "popup .5s ease",
            }}
          >
            {/* Decorations */}

            <div
              style={{
                position: "absolute",
                left: "15px",
                top: "12px",
                fontSize: "12px",
              }}
            >
              ✨ ⭐ 💖 🌸
            </div>

            <div
              style={{
                position: "absolute",
                right: "55px",
                bottom: "20px",
                fontSize: "45px",
              }}
            >
              🐰
            </div>

            {/* Close Button */}

            <button
              onClick={() => setShowReminder(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "14px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "22px",
                color: "#777",
              }}
            >
              ✕
            </button>

            {/* Title */}

            <h2
              style={{
                textAlign: "center",
                color: getReminderLabel().color,
                marginBottom: "20px",
              }}
            >
              {getReminderLabel().text}
              <div
                style={{
                  fontSize: "13px",
                  marginTop: "6px",
                  color: "#777",
                }}
              >
                Don't forget your session 💕
              </div>
            </h2>

            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
              }}
            >
              {/* Cute Alarm */}

              <div
                style={{
                  fontSize: "80px",
                  animation: "shake 2s infinite",
                }}
              >
                ⏰
              </div>

              {/* Details */}

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    color: "#333",
                  }}
                >
                  Hi {user?.name} 💖
                </h3>

                <p
                  style={{
                    color: "#666",
                    marginTop: "8px",
                    lineHeight: "24px",
                  }}
                >
                  This is a friendly reminder about your upcoming counselor
                  appointment.
                </p>

                <div
                  style={{
                    background: "linear-gradient(135deg,#FFF9E6,#FFF3C4)",
                    border: "1px solid #FFD591",
                    borderRadius: "14px",
                    padding: "12px",
                    marginTop: "10px",
                  }}
                >
                  <p>
                    👩 Counselor : {appointment?.counselorId?.name || "Counselor"}
                  </p>

                  <p>
                    📅 Date :{" "}
                    {appointment?.date ? formatDate(appointment.date) : "-"}
                  </p>

                  <p>🕙 Time : {appointment?.time || "-"}</p>

                  <p>📝 Reason : {appointment?.reason || "-"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/appointments")}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "14px",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "16px",
                background: "linear-gradient(135deg,#7C3AED,#A855F7,#EC4899)",
              }}
            >
              View My Appointments
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                color: "#777",
                fontSize: "13px",
              }}
            >
              🌸 Stay positive. We're here whenever you need support.
            </p>
          </div>
        )}

        <div className="card calm-card">
          <h3>Take a mindful moment</h3>
          <p>
            Your wellbeing matters. Track your mood, complete assessments, and
            reach support when needed.
          </p>
        </div>

        <div className="grid">
          {features.map((item) => (
            <div
              className="feature-card"
              key={item.title}
              onClick={() => navigate(item.path)}
            >
              <div className="feature-icon">{item.icon}</div>
              <p>{item.title}</p>
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    </>
  );
}

export default Dashboard;