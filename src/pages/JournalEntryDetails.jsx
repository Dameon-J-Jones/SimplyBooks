import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./ChartOfAccounts.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const JournalEntryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [lines, setLines] = useState([]);
  const [role, setRole] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  async function verifyToken() {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("/admin/all-access", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;
      setRole(userData.role);
      setData(userData);
    } catch {
      navigate("/login");
    }
  }

  useEffect(() => {
    verifyToken();
    fetchJournalEntry();
  }, [id]);

  const fetchJournalEntry = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`/journal/${id}`);
      setEntry(response.data.journalEntry || null);
      setLines(Array.isArray(response.data.lines) ? response.data.lines : []);
    } catch (err) {
      setError("Could not load journal entry.");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
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

      <NavButtons />

      <div className="coa-container">
        <h1>Journal Entry Details</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {entry && (
          <>
            <div className="ledger-card">
              <p><strong>ID:</strong> {entry.id}</p>
              <p><strong>Date:</strong> {formatDateTime(entry.EntryDate)}</p>
              <p><strong>Description:</strong> {entry.Description || "N/A"}</p>
              <p><strong>Reference Number:</strong> {entry.ReferenceNumber || "N/A"}</p>
              <p><strong>Status:</strong> {entry.status || "N/A"}</p>
              <p><strong>Created By:</strong> {entry.CreatedBy || "N/A"}</p>
              <p><strong>Created At:</strong> {formatDateTime(entry.CreatedAt)}</p>
              <p><strong>Reject Reason:</strong> {entry.rejectReason || "N/A"}</p>
            </div>

            <table className="coa-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {lines.length > 0 ? (
                  lines.map((line, index) => (
                    <tr key={line.id || index}>
                      <td>{line.account_name || "N/A"}</td>
                      <td>${formatMoney(line.Debit || line.debit)}</td>
                      <td>${formatMoney(line.Credit || line.credit)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No journal lines found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default JournalEntryDetails;