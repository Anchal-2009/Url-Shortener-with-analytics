import {
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
  Link2,
  LinkIcon,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("linklyToken");
    localStorage.removeItem("linklyUser");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="dashboard-logo">
        <div className="dashboard-logo-icon">
          <LinkIcon size={24} />
        </div>
        <span>Linkly</span>
      </div>

      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* navigation */}
      <div className={`sidebar-nav ${menuOpen ? "mobile-menu-open" : ""}`}>
        <div
          className={`nav-item ${location.pathname === "/" || location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/createlink" ? "active" : ""}`}
          onClick={() => navigate("/createlink")}
        >
          <Link2 size={16} />
          <span>Create Link</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/mylinks" ? "active" : ""}`}
          onClick={() => navigate("/mylinks")}
        >
          <Link2 size={16} />
          <span>My Links</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/analytics" ? "active" : ""}`}
          onClick={() => navigate("/analytics")}
        >
          <ChartNoAxesColumnIncreasing size={16} />
          <span>Analytics</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <Settings size={16} />
          <span>Settings</span>
        </div>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
