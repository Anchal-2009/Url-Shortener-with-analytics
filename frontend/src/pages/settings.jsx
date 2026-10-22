import { useEffect, useState } from "react";
import { UserRound, Save, ShieldCheck } from "lucide-react";
import Sidebar from "../components/sidebar";
import "../styles/Settings.css";
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:5000/api/auth";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  // Load the logged-in user's information.
  //Fetch the latest profile from the backend.
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("linklyToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
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
          throw new Error(data.message || "Unable to load profile.");
        }

        // Supports either { user: {...} } or a direct user response.
        const user = data.user || data;

        setProfile({
          name: user.name || "",
          email: user.email || "",
        });

        // Use the latest server response, not the old cached name.
        localStorage.setItem("linklyUser", JSON.stringify(user));
        localStorage.setItem(
          "linklyProfile",
          JSON.stringify({
            name: user.name || "",
            email: user.email || "",
          }),
        );
      } catch (error) {
        console.error("Profile loading error:", error);
        setMessage(error.message || "Unable to load profile.");
      }
    };
    fetchProfile();
  }, [navigate]);

  const updateProfile = async (e) => {
    e.preventDefault();

    const name = profile.name.trim();
    const token = localStorage.getItem("linklyToken");

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    if (!name) {
      setMessage("Please enter your full name.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("linklyToken");
        localStorage.removeItem("linklyUser");
        localStorage.removeItem("linklyProfile");
        setMessage("Your session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const updatedUser = data.user;

      // Update local profile only after the server confirms success.
      localStorage.setItem("linklyUser", JSON.stringify(updatedUser));
      localStorage.setItem(
        "linklyProfile",
        JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
        }),
      );

      setProfile({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      setMessage("Profile updated successfully in your account.");
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage(error.message || "Unable to update profile.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="settings-main">
        <section className="settings-content">
          <div className="settings-heading">
            <h1>Settings</h1>
            <p>Manage your account and preferences.</p>
          </div>

          {message && (
            <div className="settings-message" role="status">
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {/* Profile */}
          <section className="settings-card">
            <div className="settings-section-heading">
              <span className="settings-section-icon">
                <UserRound size={19} />
              </span>
              <div>
                <h3>Profile Information</h3>
                <p>Update your personal account details.</p>
              </div>
            </div>

            <form onSubmit={updateProfile}>
              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="profileName">Full Name</label>
                  <input
                    id="profileName"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="profileEmail">Email Address</label>
                  <input
                    id="profileEmail"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    readOnly
                  />
                </div>
              </div>

              <button className="settings-save-button" type="submit">
                <Save size={16} />
                Save Changes
              </button>
            </form>
          </section>
          {/* Security note */}
          <div className="settings-security-note">
            <ShieldCheck size={20} />
            <div>
              <strong>Your account security matters</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
