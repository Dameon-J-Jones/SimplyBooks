import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./Ledger.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const Ledger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = "username";

  const formatMoney = (value) => {
    const num = Number(String(value ?? 0).replace(/,/g, ""));
    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`/account/${id}`);
      setAccount(res.data);
      console.log("Ledger account:", res.data);
    } catch (err) {
      console.error("Error loading account:", err);
      setError("Could not load account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Tooltip id="tooltipA" />

      <section className="header">
        <h2 className="date">{formatted}</h2>
        <div className="logo">
          <LongLogo />
        </div>
        <AccountInfo username={username} />
      </section>
      <NavButtons/>

      <div className="navBar">
        <Link to="/userlist">
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

      <div className="ledger-container">

        <h1>Ledger</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {account && (
          <div className="ledger-card">
            <p><strong>Name:</strong> {account.account_name ?? "N/A"}</p>
            <p><strong>Number:</strong> {account.account_number ?? "N/A"}</p>
            <p><strong>Description:</strong> {account.description || "N/A"}</p>
            <p><strong>Normal Side:</strong> {account.normal_side || "N/A"}</p>
            <p><strong>Category:</strong> {account.category ?? "N/A"}</p>
            <p><strong>Subcategory:</strong> {account.subcategory || "N/A"}</p>
            <p><strong>Initial Balance:</strong> ${formatMoney(account.initial_balance)}</p>
            <p><strong>Debit:</strong> ${formatMoney(account.debit)}</p>
            <p><strong>Credit:</strong> ${formatMoney(account.credit)}</p>
            <p><strong>Balance:</strong> ${formatMoney(account.balance)}</p>
            <p><strong>Account Order:</strong> {account.account_order ?? "N/A"}</p>
            <p><strong>Statement:</strong> {account.statement || "N/A"}</p>
            <p><strong>Comment:</strong> {account.comment || "N/A"}</p>
            <p>
              <strong>Status:</strong>{" "}
              {account.is_active === false ? "Inactive" : "Active"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;