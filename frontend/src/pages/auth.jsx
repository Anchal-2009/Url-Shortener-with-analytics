import {
  ArrowRight,
  LinkIcon,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(location.pathname === "/login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep the form synchronized with /login and /register.
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    setError("");
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const payload = isLogin ? { email, password } : { name, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong. Please try again.",
        );
      }

      if (!data.token) {
        throw new Error(
          "The server did not return an authentication token. Check your backend response.",
        );
      }

      // Save the login token and user details.
      localStorage.setItem("linklyToken", data.token);

      if (data.user) {
        localStorage.setItem("linklyUser", JSON.stringify(data.user));
      }

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      if (isLogin) {
        navigate("/dashboard");
      } else {
        // Registration returns a token, so the user can proceed
        // directly to the dashboard.
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Make sure your backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
    });

    navigate(isLogin ? "/register" : "/login");
  };

  return (
    <main className="auth-page">
      <section className="auth-container">
        <div className="auth-form-section">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">
              <LinkIcon size={25} strokeWidth={2.7} />
            </span>
            <span>Linkly</span>
          </Link>

          <div className="auth-form-content">
            <div className="auth-heading">
              <h1>{isLogin ? "Welcome Back!" : "Create Your Account"}</h1>

              <p>
                {isLogin
                  ? "Login to your account to continue."
                  : "Join Linkly and start shortening your links today."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="auth-field">
                  <label htmlFor="name">
                    <UserRound size={16} />
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter your full name"
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">
                  <LockKeyhole size={16} />
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder={
                    isLogin ? "Enter your password" : "Create a password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}

                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="auth-switch-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}

              <button
                type="button"
                className="auth-switch-button"
                onClick={handleToggle}
                disabled={loading}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Auth;
