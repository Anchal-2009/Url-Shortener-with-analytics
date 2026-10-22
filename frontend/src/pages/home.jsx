import { Link } from "react-router-dom";
import "../styles/Home.css";
import {
  Link as LinkIcon,
  Zap,
  ChartNoAxesColumnIncreasing,
  UserRound,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function Home() {
  const features = [
    {
      icon: <Zap size={25} />,
      title: "Fast & Secure",
      description: "Lightning-fast redirects with secure-links.",
    },
    {
      icon: <ChartNoAxesColumnIncreasing size={25} />,
      title: "Detailed Analytics",
      description: "Track clicks, locations, devices, and more.",
    },
    {
      icon: <LinkIcon size={25} />,
      title: "Custom Links",
      description: "Create your own short links.",
    },
    {
      icon: <UserRound size={25} />,
      title: "User Dashboard",
      description: "Manage all your links in one place.",
    },
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        {/* navbar */}
        <header className="home-navbar">
          <Link to="/" className="home-brand">
            <span className="brand-icon">
              <LinkIcon size={24} />
            </span>
            <span>Linkly</span>
          </Link>

          <div className="navbar-auth">
            <Link to="/login" className="login-button">
              Login
            </Link>
            <Link to="/register" className="signup-button">
              Sign Up
            </Link>
          </div>
        </header>

        {/* hero-section */}
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={15} />
            <span>Smart Links. Powerful insights</span>
          </div>
          <h1>
            Shorten Your Links, <span>Track Their Performace</span>
          </h1>
          <p className="hero-description">
            Create short , shareable links with powerful analytics.
            <br />
            Simple. Fast. Reliable
          </p>
          <Link to="/register" className="get-started-button">
            Get Started <ArrowRight size={17} />
          </Link>
          <p className="hero-note">
            Free to get started. No complicated setup.
          </p>
        </div>

        {/* features */}
        <div className="hero-features" id="features">
          {features.map((feature) => (
            <article className="hero-feature" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
