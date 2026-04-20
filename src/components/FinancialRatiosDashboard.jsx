import { useEffect, useState } from "react";
import axios from "../api/axios";
import "./FinancialRatiosDashboard.css";

export default function FinancialRatiosDashboard() {
  const [ratios, setRatios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRatios = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("/dashboard");
        setRatios(response.data);
      } catch (err) {
        console.error("Error fetching dashboard ratios:", err);
        setError("Could not load financial dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchRatios();
  }, []);

  const getStatusClass = (status) => {
    if (status === "green") return "ratio-status green";
    if (status === "yellow") return "ratio-status yellow";
    return "ratio-status red";
  };

  if (loading) {
    return (
      <div className="financial-dashboard">
        <h2>Financial Dashboard</h2>
        <p>Loading ratios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-dashboard">
        <h2>Financial Dashboard</h2>
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  if (!ratios) {
    return (
      <div className="financial-dashboard">
        <h2>Financial Dashboard</h2>
        <p>No ratio data available.</p>
      </div>
    );
  }

  return (
    <div className="financial-dashboard">
      <h2>Financial Dashboard</h2>
      <p className="dashboard-subtitle">
        View key financial ratios and performance indicators after logging in.
      </p>

      <div className="ratios-grid">
        <div className="ratio-card">
          <h3>Current Ratio</h3>
          <p className="ratio-value">{ratios.currentRatio.value}</p>
          <span className={getStatusClass(ratios.currentRatio.status)}>
            {ratios.currentRatio.status.toUpperCase()}
          </span>
        </div>

        <div className="ratio-card">
          <h3>Debt Ratio</h3>
          <p className="ratio-value">{ratios.debtRatio.value}</p>
          <span className={getStatusClass(ratios.debtRatio.status)}>
            {ratios.debtRatio.status.toUpperCase()}
          </span>
        </div>

        <div className="ratio-card">
          <h3>Debt to Equity</h3>
          <p className="ratio-value">{ratios.debtToEquity.value}</p>
          <span className={getStatusClass(ratios.debtToEquity.status)}>
            {ratios.debtToEquity.status.toUpperCase()}
          </span>
        </div>

        <div className="ratio-card">
          <h3>Profit Margin</h3>
          <p className="ratio-value">{ratios.profitMargin.value}</p>
          <span className={getStatusClass(ratios.profitMargin.status)}>
            {ratios.profitMargin.status.toUpperCase()}
          </span>
        </div>

        <div className="ratio-card net-income-card">
          <h3>Net Income</h3>
          <p className="ratio-value">${Number(ratios.netIncome).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}