import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import LongLogo from "../components/LongLogo";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import "./HomePage.module.css";
import "./AccountHomePage.css";
import styles from "./HomePage.module.css";
import AccountInfo from "../components/AccountInfo";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Logout from "../components/Logout";
import NavButtons from "../components/NavButtons";
import JournalNotification from "../components/JournalNotification";

const AccountantHomePage = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [data, setData] = useState({});
  const [ratios, setRatios] = useState(null);
  const [ratioError, setRatioError] = useState("");
  const [ratioLoading, setRatioLoading] = useState(true);

  const navigate = useNavigate();

  async function verifyToken() {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("/admin/accountant-access", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setData(response.data);
    } catch (error) {
      console.log(error);
      navigate("/login");
    }
  }

  async function fetchRatios() {
    try {
      setRatioLoading(true);
      setRatioError("");

      const response = await axios.get("/dashboard", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setRatios(response.data);
    } catch (error) {
      console.log("Error fetching ratios:", error);
      setRatioError("Could not load financial ratios.");
    } finally {
      setRatioLoading(false);
    }
  }

  useEffect(() => {
    verifyToken();
    fetchRatios();
  }, []);

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  const getStatusStyle = (status) => {
    if (status === "green") {
      return {
        backgroundColor: "#16a34a",
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold",
        display: "inline-block",
      };
    }

    if (status === "yellow") {
      return {
        backgroundColor: "#eab308",
        color: "black",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold",
        display: "inline-block",
      };
    }

    return {
      backgroundColor: "#dc2626",
      color: "white",
      padding: "6px 12px",
      borderRadius: "20px",
      fontWeight: "bold",
      display: "inline-block",
    };
  };

  const cardStyle = {
    background: "#f8f9fb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
  };

  const valueStyle = {
    fontSize: "28px",
    fontWeight: "bold",
  };

  return (
    <div className="page">
      <Tooltip id="tooltipA" />

      <section className="header">
        <h2 className="date">{formatted}</h2>
        <div className="logo"><LongLogo /></div>
        <AccountInfo username={username} />
      </section>

      <div className="navBar">
        <Link to="/UserList">
          <button
            type="button"
            className="create-user-button"
            data-tooltip-id="tooltipA"
            data-tooltip-content="User List"
            data-tooltip-place="bottom"
          >
            User List
          </button>
        </Link>

        <Link to="/accounts">
          <button
            type="button"
            className="create-user-button"
            data-tooltip-id="tooltipA"
            data-tooltip-content="Chart of Accounts"
            data-tooltip-place="bottom"
          >
            Charts
          </button>
        </Link>
      </div>

      <NavButtons />

      {isPopupOpen && (
        <div className="PopDiv">
          <p>
            Accountants can securely manage financial records, track transactions,
            generate reports, and oversee user accounts within the system.
          </p>
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>
      )}

      <div className="body">
        <h1>Accountant</h1>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>Financial Dashboard</h2>

          {ratioLoading && <p>Loading ratios...</p>}
          {ratioError && <p style={{ color: "red" }}>{ratioError}</p>}

          {!ratioLoading && !ratioError && ratios && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "16px",
              }}
            >
              <div style={cardStyle}>
                <h3>Current Ratio</h3>
                <p style={valueStyle}>{ratios.currentRatio.value}</p>
                <span style={getStatusStyle(ratios.currentRatio.status)}>
                  {ratios.currentRatio.status.toUpperCase()}
                </span>
              </div>

              <div style={cardStyle}>
                <h3>Debt Ratio</h3>
                <p style={valueStyle}>{ratios.debtRatio.value}</p>
                <span style={getStatusStyle(ratios.debtRatio.status)}>
                  {ratios.debtRatio.status.toUpperCase()}
                </span>
              </div>

              <div style={cardStyle}>
                <h3>Debt to Equity</h3>
                <p style={valueStyle}>{ratios.debtToEquity.value}</p>
                <span style={getStatusStyle(ratios.debtToEquity.status)}>
                  {ratios.debtToEquity.status.toUpperCase()}
                </span>
              </div>

              <div style={cardStyle}>
                <h3>Profit Margin</h3>
                <p style={valueStyle}>{ratios.profitMargin.value}</p>
                <span style={getStatusStyle(ratios.profitMargin.status)}>
                  {ratios.profitMargin.status.toUpperCase()}
                </span>
              </div>

              <div
                style={{
                  ...cardStyle,
                  background: "#eef6ff",
                  border: "1px solid #dbeafe",
                }}
              >
                <h3>Net Income</h3>
                <p style={valueStyle}>
                  ${Number(ratios.netIncome).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            marginTop: "20px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <JournalNotification />
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <Link to="/UserList">
              <button
                type="button"
                className="create-user-button"
                data-tooltip-id="tooltipA"
                data-tooltip-content="View A List Of Current Users"
                data-tooltip-place="top"
              >
                View Users
              </button>
            </Link>

            <Link to="/create-account">
              <button
                type="button"
                className="create-user-button"
                data-tooltip-id="tooltipA"
                data-tooltip-content="Create A New User"
                data-tooltip-place="top"
              >
                Create New User
              </button>
            </Link>

            <button className="help-button" onClick={() => setPopupOpen(true)}>
              Help
            </button>

            <Logout />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantHomePage;