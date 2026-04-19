import { useEffect, useState } from "react";
import api from "../api/axios";
import "./RatioDashboard.css";

export default function RatioDashboard() {
  const [ratios, setRatios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRatios();
  }, []);

  async function loadRatios() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/dashboard");
      setRatios(response.data);
    } catch (err) {
      console.error("Error loading dashboard ratios:", err);
      setError("Could not load dashboard ratios.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="ratio-dashboard">
        <h2>Financial Dashboard</h2>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ratio-dashboard">
        <h2>Financial Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const ratioCards = [
    ratios?.currentRatio,
    ratios?.debtRatio,
    ratios?.debtToEquity,
    ratios?.profitMargin,
  ].filter(Boolean);

  return (
    <div className="ratio-dashboard">
      <div className="ratio-dashboard-header">
        <h2>Financial Dashboard</h2>
        <p>Green = good, Yellow = warning, Red = needs closer look</p>
      </div>

      <div className="ratio-grid">
        {ratioCards.map((ratio) => (
          <div key={ratio.label} className={`ratio-card ratio-${ratio.status}`}>
            <h3>{ratio.label}</h3>
            <p className="ratio-value">{ratio.value}</p>
            <p className="ratio-description">{ratio.description}</p>
          </div>
        ))}
      </div>

      <div className="net-income-card">
        <h3>Net Income</h3>
        <p>
          $
          {Number(ratios?.netIncome || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}
