import {
  ArrowRight,
  ChevronDown,
  CircleCheck,
  Copy,
  ExternalLink,
  LinkIcon,
  MousePointerClick,
  Search,
  Trash,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import "../styles/Dashboard.css";
const API_URL = "http://localhost:5000/api/urls";

function Dashboard() {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("linklyToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          localStorage.removeItem("linklyToken");
          localStorage.removeItem("linklyUser");
          localStorage.removeItem("linklyProfile");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch profile.");
        }

        const latestUser = data.user || data;

        setUser(latestUser);

        localStorage.setItem("linklyUser", JSON.stringify(latestUser));
        localStorage.setItem("linklyProfile", JSON.stringify(latestUser));
      } catch (error) {
        console.error("Profile loading error:", error);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setError("");

        const token = localStorage.getItem("linklyToken");
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load links.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response received from the server.");
        }

        const formattedLinks = data.map((link) => ({
          ...link,
          id: link.id || link._id,
          shortUrl: link.shortUrl || `http://localhost:5000/${link.shortCode}`,
          createdAt: link.createdAt
            ? new Date(link.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
        }));

        setLinks(formattedLinks);
      } catch (err) {
        setError(
          err.message ||
            "Could not connect to the backend. Check whether your server is running.",
        );
      }
    };

    fetchLinks();
  }, []);

  const totalClicks = links.reduce(
    (total, link) => total + (Number(link.clicks) || 0),
    0,
  );

  const totalLinks = links.length;
  const activeLinks = links.length;

  //copy short url
  const handleCopy = async (shortUrl) => {
    const fullUrl = shortUrl.startsWith("http")
      ? shortUrl
      : `http://localhost:5000/${shortUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("Short Url copied successfully");
    } catch {
      alert("Could not copy the url. Please copy it manually");
    }
  };

  //delete link
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this link",
    );
    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("linklyToken");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete the link.");
      }

      setLinks((previousLinks) =>
        previousLinks.filter((link) => link.id !== id),
      );
    } catch (err) {
      alert(err.message || "Could not delete this link.");
    }
  };

  //display only first five links
  const recentLinks = links.slice(0, 5);

  return (
    <div className="dashboard-layout">
      {/* sidebar */}
      <Sidebar />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-heading">
            <div>
              <h1>Hello, {user.name}! 👋</h1>
              <p>Here's an overview of your links.</p>
            </div>
          </div>

          <div className="dashboard-profile-wrapper">
            <button
              type="button"
              className="dashboard-profile"
              onClick={() => setProfileOpen((previous) => !previous)}
              aria-expanded={profileOpen}
            >
              <span className="dashboard-avatar">
                {user.name
                  ? user.name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0].toUpperCase())
                      .join("")
                  : "U"}
              </span>
              <ChevronDown size={16} />
            </button>

            {profileOpen && (
              <div className="dashboard-profile-dropdown">
                <UserRound size={20} />
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-stats-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon icon-links">
                <LinkIcon size={23} />
              </div>
              <div className="dashboard-stat-info">
                <p>Total Links</p>
                <h2>{totalLinks}</h2>
                <span>Your Shortened Links</span>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon icon-clicks">
                <MousePointerClick size={23} />
              </div>
              <div className="dashboard-stat-info">
                <p>Total Clicks</p>
                <h2>{totalClicks.toLocaleString()}</h2>
                <span>Across all links</span>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon icon-active">
                <CircleCheck size={23} />
              </div>
              <div className="dashboard-stat-info">
                <p>Active Links</p>
                <h2>{activeLinks}</h2>
                <span>Currently available</span>
              </div>
            </article>
          </section>

          {/* recent-links */}
          <section className="recent-links-card">
            <div className="recent-links-heading">
              <div>
                <h2>Recent Links</h2>
                <p>Manage your recently created short links.</p>
              </div>

              <button
                type="button"
                className="view-all-button"
                onClick={() => navigate("/mylinks")}
              >
                View All <ArrowRight size={15} />
              </button>
            </div>

            <div className="dashboard-table-wrapper">
              {links.length === 0 ? (
                <div className="dashboard-empty-state">
                  <Search size={28} />
                  <h3>No links found</h3>
                  <p>You haven't created any shortened links yet.</p>
                </div>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Original URL</th>
                      <th>Short URL</th>
                      <th>Clicks</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentLinks.map((link) => (
                      <tr key={link.id}>
                        <td>
                          <div className="original-url-cell">
                            <ExternalLink size={14} />
                            <span title={link.originalUrl}>
                              {link.originalUrl}
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="short-url-button"
                            onClick={() => handleCopy(link.shortUrl)}
                            title="Copy short URL"
                          >
                            <span>{link.shortUrl}</span>
                            <Copy size={14} />
                          </button>
                        </td>

                        <td className="dashboard-click-count">
                          {link.clicks || 0}
                        </td>

                        <td className="dashboard-created-date">
                          {link.createdAt}
                        </td>

                        <td>
                          <div className="dashboard-table-actions">
                            <button
                              type="button"
                              className="delete-action"
                              title="Delete link"
                              aria-label="Delete link"
                              onClick={() => handleDelete(link.id)}
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
