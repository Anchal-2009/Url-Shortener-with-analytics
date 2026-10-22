import { useMemo, useState } from "react";
import Sidebar from "../components/sidebar";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Link2,
  MousePointerClick,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "../styles/MyLinks.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:5000/api/urls";

function MyLinks() {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLink, setSelectedLink] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [linksPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      const token = localStorage.getItem("linklyToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          localStorage.removeItem("linklyToken");
          localStorage.removeItem("linklyUser");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch links.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        const formattedLinks = data.map((link) => ({
          id: String(link.id || link._id),
          originalUrl: link.originalUrl,
          shortCode: link.shortCode,
          shortUrl: link.shortUrl || `http://localhost:5000/${link.shortCode}`,
          clicks: link.clicks ?? 0,
          createdAt: link.createdAt
            ? new Date(link.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—",
        }));

        setLinks(formattedLinks);
      } catch (error) {
        console.error("Failed to load links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [navigate]);

  const filteredLinks = useMemo(() => {
    const query = search.toLowerCase().trim();

    return links.filter(
      (link) =>
        link.originalUrl.toLowerCase().includes(query) ||
        link.shortCode.toLowerCase().includes(query),
    );
  }, [links, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLinks.length / linksPerPage),
  );

  const startIndex = (currentPage - 1) * linksPerPage;

  const currentLinks = filteredLinks.slice(
    startIndex,
    startIndex + linksPerPage,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  //copy
  const getShortUrl = (link) =>
    link.shortUrl || `http://localhost:5000/${link.shortCode}`;
  const copyLink = async (link) => {
    const shortUrl = getShortUrl(link);

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(link.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch {
      window.prompt("Copy this link:", shortUrl);
    }
  };

  //delete
  const deleteLink = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this link?",
    );

    if (!confirmed) return;

    const token = localStorage.getItem("linklyToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("linklyToken");
        localStorage.removeItem("linklyUser");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete the link.");
      }

      setLinks((previous) => previous.filter((link) => link.id !== String(id)));

      setSelectedLink((previous) =>
        previous && previous.id === String(id) ? null : previous,
      );
    } catch (error) {
      alert(error.message || "Could not delete this link.");
    }
  };

  //open details
  const openDetails = (link) => {
    setSelectedLink(link);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="my-links-layout">
        <main className="my-links-main">
          <section className="my-links-content">
            <div className="my-links-heading">
              <h1>My Links</h1>
              <p>Manage and track all your shortened URLs.</p>
            </div>

            <div className="my-links-toolbar">
              <div className="my-links-search">
                <Search size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by original URL or by short code..."
                />
              </div>

              <span className="my-links-count">
                {filteredLinks.length} links
              </span>
            </div>

            <div className="my-links-table-card">
              <div className="my-links-table-scroll">
                <table className="my-links-table">
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
                    {currentLinks.map((link) => (
                      <tr key={link.id}>
                        <td className="my-links-original">
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>{link.originalUrl}</span>
                            <ExternalLink size={13} />
                          </a>
                        </td>

                        <td>
                          <span className="my-links-short">
                            <Link2 size={14} />
                            http://localhost:5000/{link.shortCode}
                          </span>
                        </td>

                        <td>
                          <span className="my-links-clicks">{link.clicks}</span>
                        </td>

                        <td>
                          <span className="my-links-date">
                            {link.createdAt}
                          </span>
                        </td>

                        <td>
                          <div className="my-links-actions">
                            <button
                              type="button"
                              title="Copy short URL"
                              aria-label="Copy short URL"
                              onClick={() => copyLink(link)}
                            >
                              {copiedId === link.id ? (
                                "Copied!"
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              title="Show details"
                              onClick={() => openDetails(link)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              title="Delete link"
                              aria-label="Delete link"
                              className="my-links-delete"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {currentLinks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="my-links-empty">
                          No links found. Try another search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="my-links-pagination">
                <span>
                  Showing {filteredLinks.length === 0 ? 0 : startIndex + 1}
                  {"–"}
                  {Math.min(startIndex + linksPerPage, filteredLinks.length)}
                  {" of "}
                  {filteredLinks.length} links
                </span>

                <div>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={
                        currentPage === page ? "my-links-page-active" : ""
                      }
                      aria-current={currentPage === page ? "page" : undefined}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* link-details-modal */}
      {selectedLink && (
        <div
          className="my-links-modal-overlay"
          onClick={() => setSelectedLink(null)}
        >
          <section
            className="my-links-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-links-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="my-links-modal-header">
              <div>
                <h2 id="my-links-details-title">Link Details</h2>
                <p>Information about shortened link</p>
              </div>

              <button
                className="my-links-modal-close"
                aria-label="Close details"
                onClick={() => setSelectedLink(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="my-links-details-body">
              <div className="my-links-detail-stat">
                <span className="my-links-detail-icon">
                  <MousePointerClick size={20} />
                </span>
                <div>
                  <span>Total Clicks</span>
                  <strong>{selectedLink.clicks}</strong>
                </div>
              </div>

              <div className="my-links-detail-field">
                <label>Original URL</label>
                <a
                  href={selectedLink.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="my-links-detail-url"
                >
                  <Globe size={16} />
                  <span>{selectedLink.originalUrl}</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="my-links-detail-field">
                <label>Short URL</label>
                <div className="my-links-detail-copy-row">
                  <span className="my-links-detail-short">
                    <Link2 size={16} />
                    {getShortUrl(selectedLink)}
                  </span>
                  <button
                    onClick={() => copyLink(selectedLink)}
                    className="my-links-detail-copy"
                  >
                    <Copy size={15} />
                    {copiedId === selectedLink.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="my-links-detail-field">
                <label>Short Code</label>
                <span className="my-links-detail-value">
                  {selectedLink.shortCode}
                </span>
              </div>

              <div className="my-links-detail-field">
                <label>Created At</label>
                <span className="my-links-detail-value">
                  <CalendarDays size={16} />
                  {selectedLink.createdAt}
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default MyLinks;
