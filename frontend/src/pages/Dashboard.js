import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const features = [
  { title: "Mood Tracker", icon: "😊", path: "/mood" },
  { title: "Assessment", icon: "📝", path: "/assessment" },
  { title: "Counselor", icon: "👩‍⚕️", path: "/counselor" },
  { title: "Appointments", icon: "📅", path: "/appointments" },
  { title: "Calm Videos", icon: "🎥", path: "/videos" },
  { title: "Music", icon: "🎧", path: "/music" },
  { title: "Medication", icon: "💊", path: "/medication" },
  { title: "Emergency", icon: "🚨", path: "/emergency" },
  { title: "AI Chatbot", icon: "🤖", path: "/chatbot" },
];

  return (
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
  );
}

export default Dashboard;