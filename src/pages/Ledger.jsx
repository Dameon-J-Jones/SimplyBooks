import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./Ledger.css";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

// Page shows details for one account based on its ID

const Ledger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = "username";

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      const res = await axios.get(`/account/${id}`);
      setAccount(res.data);
    } catch (err) {
      console.error("Error loading account:", err);
      setError("Could not load account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Tooltip id="tooltipA"/>
      <section className="header">
        <h2 className="date">{formatted}</h2>
        <div className="logo">
          <LongLogo />
        </div>
        <AccountInfo username={username} />
      </section>


      <div className="navBar">
        <Link to="/UserList">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="User List"
          data-tooltip-place="bottom"
          >User List</button>
        </Link>
        <Link to="/accounts">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="Chart of Accounts"
          data-tooltip-place="bottom"
          >Charts</button>
        </Link>
      </div>

      <div className="ledger-container">
        <button onClick={() => navigate("/accounts")}>
          Back
        </button>

        <h1>Ledger</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {account && (
          <div className="ledger-card">
            <p><strong>Name:</strong> {account.account_name}</p>
            <p><strong>Number:</strong> {account.account_number}</p>
            <p><strong>Category:</strong> {account.category}</p>
            <p><strong>Balance:</strong> {account.balance}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
