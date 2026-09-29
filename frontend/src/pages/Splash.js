import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mindcare-logo.jpeg";
import "./Splash.css";

const SPLASH_MS = 3000;

// Small 4-point sparkle used as decoration
const Sparkle = ({ className }) => (
  <svg className={`sparkle ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
  </svg>
);

// Moon phase row (crescent, gibbous, full, gibbous, crescent)
const MoonPhases = () => (
  <svg className="moon-phases" viewBox="0 0 200 40" aria-hidden="true">
    <path d="M22 8 A12 12 0 1 0 22 32 A8 12 0 1 1 22 8 Z" />
    <path d="M62 5 A15 15 0 1 0 62 35 A9 15 0 1 1 62 5 Z" />
    <circle cx="100" cy="20" r="15" className="full-moon" />
    <path d="M138 5 A15 15 0 1 1 138 35 A9 15 0 1 0 138 5 Z" />
    <path d="M178 8 A12 12 0 1 1 178 32 A8 12 0 1 0 178 8 Z" />
  </svg>
);

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Logged-in users go straight to the dashboard
      const token = localStorage.getItem("token");
      navigate(token ? "/dashboard" : "/login", { replace: true });
    }, SPLASH_MS);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="calm-bg splash">
      <Sparkle className="sp-1" />
      <Sparkle className="sp-2" />
      <Sparkle className="sp-3" />
      <Sparkle className="sp-4" />

      <MoonPhases />

      <div className="logo-halo">
        <div className="logo-badge">
          <img src={logo} alt="MindCare logo" />
        </div>
      </div>

      <h1 className="splash-title">MindCare</h1>
      <p className="splash-tagline">Find your calm. Nurture your mind.</p>

      <div className="splash-dots" aria-label="Loading">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

export default Splash;