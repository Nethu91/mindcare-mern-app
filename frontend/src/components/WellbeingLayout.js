import { useNavigate } from "react-router-dom";
import "../styles/wellbeing.css";
export default function WellbeingLayout({ title, children }) {
  const nav = useNavigate();
  return (
    <main className="wb">
      <header>
        <button
          aria-label="Back to dashboard"
          onClick={() => nav("/dashboard")}
        >
          ←
        </button>
        <h1>{title}</h1>
        <span>💜</span>
      </header>
      {children}
    </main>
  );
}
