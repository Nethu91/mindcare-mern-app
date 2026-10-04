import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
export default function NotificationBell() {
  const { pathname } = useLocation(),
    navigate = useNavigate();
  const [count, setCount] = useState(null);
  const visible =
    !["/", "/login", "/register", "/verify-otp", "/dashboard"].includes(
      pathname,
    ) && Boolean(localStorage.getItem("token"));
  useEffect(() => {
    if (!visible) return;
    let active = true;
    const load = () =>
      API.get("/wellbeing/notifications")
        .then((r) => {
          if (active) setCount(r.data.filter((n) => !n.read).length);
        })
        .catch(() => {
          if (active) setCount(null);
        });
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener("mindcare-notifications", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("mindcare-notifications", load);
    };
  }, [pathname, visible]);
  if (!visible) return null;
  return (
    <div className="notification-toolbar">
      <button
        className="global-notification-bell"
        aria-label={`Open notifications${count !== null ? `, ${count} unread` : ""}`}
        onClick={() => navigate("/notifications")}
      >
        🔔{count > 0 && <span>{count}</span>}
      </button>
    </div>
  );
}
