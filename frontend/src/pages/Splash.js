import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mobile-container splash-screen">
      <div className="splash-content">
        <div className="logo-circle">🧠</div>
        <h1>MindCare</h1>
        <p>Your calm space for mental wellbeing</p>
      </div>
    </div>
  );
}

export default Splash;