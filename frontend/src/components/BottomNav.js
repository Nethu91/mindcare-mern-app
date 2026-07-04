import { Link, useLocation } from "react-router-dom";
import { Home, Smile, ClipboardList, PhoneCall, User } from "lucide-react";

function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      label: "Home",
      path: "/dashboard",
      icon: <Home size={21} />,
      colorClass: "home-active",
    },
    {
      label: "Mood",
      path: "/mood",
      icon: <Smile size={21} />,
      colorClass: "mood-active",
    },
    {
      label: "Test",
      path: "/assessment",
      icon: <ClipboardList size={21} />,
      colorClass: "test-active",
    },
    {
      label: "SOS",
      path: "/emergency",
      icon: <PhoneCall size={21} />,
      colorClass: "sos-active",
    },
    {
      label: "Profile",
      path: "/profile",
      icon: <User size={21} />,
      colorClass: "profile-active",
    },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.label}
            to={item.path}
            className={
              isActive
                ? `bottom-nav-link active ${item.colorClass}`
                : "bottom-nav-link"
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default BottomNav;