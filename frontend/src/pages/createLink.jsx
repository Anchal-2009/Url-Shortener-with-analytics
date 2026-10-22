import { useState } from "react";
import Sidebar from "../components/sidebar";
import { AlertCircle, Check, Copy, Lightbulb, Link2 } from "lucide-react";
import "../styles/CreateLink.css";

function CreateLink() {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setCopied(false);

    const cleanedUrl = longUrl.trim();
    const alias = customAlias.trim();

    if (!cleanedUrl) {
      setError("Please enter a URL.");
      return;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(cleanedUrl);
    } catch {
      setError("Please enter a valid URL, including https://");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Only HTTP and HTTPS URLs are supported.");
      return;
    }

    // Validate the alias before sending the API request.
    if (alias && !/^[a-zA-Z0-9_-]{3,30}$/.test(alias)) {
      setError(
        "Alias must be 3–30 characters and contain only letters, numbers, _ or -.",
      );
      return;
    }

    // Read the token saved during login or registration.
    const token = localStorage.getItem("linklyToken");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl: parsedUrl.href,
          customAlias: alias,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("linklyToken");
        localStorage.removeItem("linklyUser");
        throw new Error(
          "Your session is invalid or expired. Please log in again.",
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to shorten URL.");
      }

      if (!data.shortUrl) {
        throw new Error("The server did not return a short URL.");
      }

      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please check that your backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the link. Please copy it manually.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="create-link-main">
        <section className="create-link-content">
          <div className="create-link-heading">
            <h1>Create Short Link</h1>
            <p>Paste a long URL and get a short, shareable link.</p>
          </div>

          <div className="create-link-card">
            <form onSubmit={handleShorten}>
              <div className="create-link-field">
                <label htmlFor="longUrl">
                  Long URL <span className="required-star">*</span>
                </label>

                <input
                  id="longUrl"
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  value={longUrl}
                  onChange={(e) => {
                    setLongUrl(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>

              <div className="create-link-field">
                <label htmlFor="customAlias">
                  Custom Alias{" "}
                  <span className="optional-label">(Optional)</span>
                </label>

                <div className="create-link-alias">
                  <input
                    id="customAlias"
                    type="text"
                    placeholder="my-link"
                    value={customAlias}
                    maxLength={30}
                    onChange={(e) => {
                      setCustomAlias(e.target.value);
                      setError("");
                    }}
                  />
                  <span>linkly.in/</span>
                </div>
              </div>

              {error && (
                <div className="create-link-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="create-link-submit"
                disabled={loading}
              >
                <Link2 size={17} />
                {loading ? "Creating..." : "Shorten URL"}
              </button>
            </form>

            {shortUrl && (
              <div className="create-link-result">
                <div className="create-link-result-info">
                  <span>Your Shortened URL</span>
                  <strong>{shortUrl}</strong>
                </div>

                <button
                  type="button"
                  className="create-link-copy"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            <div className="create-link-tip">
              <Lightbulb size={18} />
              <p>
                <strong>Tip:</strong> You can create custom aliases (e.g.,{" "}
                <span>linkly.in/myproject</span>)
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CreateLink;
