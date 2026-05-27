import { Link } from "react-router-dom";
import { Home, Smile, ClipboardList, PhoneCall, User } from "lucide-react";

function BottomNav() {
  return (
    <div className="bottom-nav">
      <Link to="/dashboard"><Home size={21} /><span>Home</span></Link>
      <Link to="/mood"><Smile size={21} /><span>Mood</span></Link>
      <Link to="/assessment"><ClipboardList size={21} /><span>Test</span></Link>
      <Link to="/emergency"><PhoneCall size={21} /><span>SOS</span></Link>
      <Link to="/profile"><User size={21} /><span>Profile</span></Link>
    </div>
  );
}

export default BottomNav;