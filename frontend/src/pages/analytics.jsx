import { useState } from "react";
import { MousePointerClick, Users, Link2, CalendarDays } from "lucide-react";
import Sidebar from "../components/sidebar";
import "../styles/Analytics.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const periods = {
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 90 days": 90,
};

const API_URL = "http://localhost:5000/api/urls/analytics/summary";

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalLinks: 0,
    totalClicks: 0,
    topLinks: [],
    clicksOverTime: [],
  });
  const [period, setPeriod] = useState("Last 7 days");

  useEffect(() => {
    const fetchAnalytics = async () => {
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
          throw new Error(data.message || "Unable to fetch analytics.");
        }

        setAnalytics({
          totalLinks: data.totalLinks ?? 0,
          totalClicks: data.totalClicks ?? 0,
          topLinks: data.topLinks ?? [],
          clicksOverTime: data.clicksOverTime ?? [],
        });
      } catch (error) {
        console.error("Analytics fetch error:", error);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  const days = periods[period];

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - days + 1);

  // Normalize and filter the backend data.
  const rawChartData = (analytics.clicksOverTime || [])
    .map((item) => {
      // Some backends return "_id" instead of "date".
      const rawDate = item.date ?? item._id;

      if (!rawDate) return null;

      // Support YYYY-MM-DD and ISO date-time strings.
      const dateString =
        rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : String(rawDate).slice(0, 10);

      const date = new Date(`${dateString}T12:00:00`);

      if (Number.isNaN(date.getTime())) return null;

      return {
        date: dateString,
        dateObject: date,
        clicks: Number(item.clicks ?? item.count ?? 0) || 0,
      };
    })
    .filter(
      (item) =>
        item !== null &&
        item.dateObject >= startDate &&
        item.dateObject <= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group data for the selected period.
  const groupSize =
    period === "Last 7 days" ? 1 : period === "Last 30 days" ? 2 : 7;

  const chartData = [];

  for (let i = 0; i < rawChartData.length; i += groupSize) {
    const group = rawChartData.slice(i, i + groupSize);

    chartData.push({
      date: group[0].date,
      clicks: group.reduce((sum, item) => sum + item.clicks, 0),
    });
  }

  const maxValue = Math.max(...chartData.map((item) => item.clicks), 1);

  const periodClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="analytics-main">
        <header className="analytics-topbar">
          <div className="analytics-period">
            <CalendarDays size={15} />

            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {Object.keys(periods).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="analytics-content">
          <div className="analytics-heading">
            <h1>Link Analytics</h1>
            <p>Detailed insights about your links.</p>
          </div>

          <div className="analytics-stat-grid">
            <article className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Total Clicks</span>

                <span className="analytics-icon blue">
                  <MousePointerClick size={20} />
                </span>
              </div>

              <h2>{analytics.totalClicks.toLocaleString()}</h2>

              <span className="analytics-growth">
                {periodClicks.toLocaleString()} clicks in selected period
              </span>
            </article>

            <article className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Total Links</span>

                <span className="analytics-icon purple">
                  <Users size={20} />
                </span>
              </div>

              <h2>{analytics.totalLinks.toLocaleString()}</h2>

              <span className="analytics-growth">Links Created</span>
            </article>

            <article className="analytics-stat-card">
              <div className="analytics-stat-top">
                <span>Top Link</span>

                <span className="analytics-icon green">
                  <Link2 size={20} />
                </span>
              </div>

              {analytics.topLinks.length > 0 ? (
                <>
                  <h2 className="analytics-top-code">
                    http://localhost:5000/{analytics.topLinks[0].shortCode}
                  </h2>
                  <p>{analytics.topLinks[0].clicks} clicks</p>
                </>
              ) : (
                <>
                  <h2 className="analytics-top-code">No links yet</h2>
                  <p>0 clicks</p>
                </>
              )}
            </article>
          </div>

          <div className="analytics-panels">
            <section className="analytics-chart-card">
              <h3>Clicks Over Time</h3>

              <p className="analytics-panel-subtitle">
                {periodClicks.toLocaleString()} clicks during {period}
              </p>

              <div className="analytics-chart">
                {chartData.length > 0 ? (
                  chartData.map((item, index) => (
                    <div
                      className="analytics-bar-column"
                      key={`${item.date}-${index}`}
                    >
                      <span className="analytics-bar-value">{item.clicks}</span>

                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar"
                          style={{
                            height: `${
                              maxValue > 0 && item.clicks > 0
                                ? Math.max((item.clicks / maxValue) * 100, 3)
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                      <span className="analytics-bar-label">
                        {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No click data available for this period.</p>
                )}
              </div>
            </section>

            <section className="analytics-top-links-card">
              <h3>Top Links</h3>

              <div className="analytics-top-links-header">
                <span>Link</span>
                <span>Clicks</span>
              </div>

              {analytics.topLinks.map((link) => (
                <div
                  className="analytics-top-link-row"
                  key={link.id || link._id}
                >
                  <span>
                    <Link2 size={13} />
                    http://localhost:5000/{link.shortCode}
                  </span>

                  <strong>{link.clicks} clicks</strong>
                </div>
              ))}

              {analytics.topLinks.length === 0 && (
                <p className="my-links-empty">No links available yet.</p>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
