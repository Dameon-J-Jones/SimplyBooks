import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./ChartOfAccounts.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const JournalList = () => {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [service, setService] = useState("pending");
  const [role, setRole] = useState("");
  const [data, setData] = useState({});
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState({});

  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({
    entryId: "",
    description: "",
    reference: "",
    account: "",
    amount: "",
    createdBy: "",
    date: "",
  });

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

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  const getBackendStatus = () => {
    if (service === "approved") return "APPROVED";
    if (service === "rejected") return "REJECTED";
    return "PENDING";
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/journal", {
        params: {
          status: getBackendStatus(),
        },
      });

      const rows = Array.isArray(response.data) ? response.data : [];

      const hydrated = await Promise.all(
        rows.map(async (entry) => {
          try {
            const detailRes = await axios.get(`/journal/${entry.id}`);
            const detail = detailRes.data || {};

            return {
              ...entry,
              lines: Array.isArray(detail.lines) ? detail.lines : [],
            };
          } catch {
            return {
              ...entry,
              lines: [],
            };
          }
        })
      );

      setEntries(hydrated);
    } catch {
      setError("Could not load journal entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchEntries();
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReasonChange = (id, value) => {
    setSelectedReasons((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleApprove = async (id) => {
    try {
      setActionError("");
      setActionSuccess("");

      await axios.patch(`/journal/${id}/approve`, {
        userId: data.user,
      });

      setActionSuccess("Journal entry approved.");
      fetchEntries();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not approve entry.");
    }
  };

  const handleReject = async (id) => {
    try {
      setActionError("");
      setActionSuccess("");

      const reason = selectedReasons[id] || "";

      if (reason.trim() === "") {
        setActionError("Enter a reject reason.");
        return;
      }

      await axios.patch(`/journal/${id}/reject`, {
        userId: data.user,
        reason,
      });

      setActionSuccess("Journal entry rejected.");
      fetchEntries();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not reject entry.");
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

  const formatDateOnly = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString();
  };

  const getEntryDate = (entry) =>
    entry?.EntryDate || entry?.entryDate || entry?.entry_date || "";

  const getDescription = (entry) =>
    entry?.Description || entry?.description || "";

  const getReference = (entry) =>
    entry?.ReferenceNumber || entry?.referenceNumber || "";

  const getCreatedBy = (entry) =>
    entry?.CreatedBy || entry?.createdBy || "";

  const sortLinesDebitFirst = (lines) => {
    return [...lines].sort((a, b) => {
      const aDebit = Number(a?.Debit || a?.debit || 0);
      const aCredit = Number(a?.Credit || a?.credit || 0);
      const bDebit = Number(b?.Debit || b?.debit || 0);
      const bCredit = Number(b?.Credit || b?.credit || 0);

      const aType = aDebit > 0 ? 0 : aCredit > 0 ? 1 : 2;
      const bType = bDebit > 0 ? 0 : bCredit > 0 ? 1 : 2;

      return aType - bType;
    });
  };

  const getLines = (entry) => {
    const lines = Array.isArray(entry?.lines) ? entry.lines : [];
    return sortLinesDebitFirst(lines);
  };

  const getAccountNames = (entry) => {
    const lines = getLines(entry);

    if (lines.length === 0) return "N/A";

    const names = lines
      .map((line) => line?.account_name || "")
      .filter(Boolean);

    return names.length > 0 ? names.join(", ") : "N/A";
  };

  const getAmount = (entry) => {
    const lines = getLines(entry);

    if (lines.length === 0) return "0.00";

    const debitLine = lines.find(
      (line) => Number(line?.Debit || line?.debit || 0) > 0
    );

    if (debitLine) {
      return String(debitLine?.Debit || debitLine?.debit || 0);
    }

    const creditLine = lines.find(
      (line) => Number(line?.Credit || line?.credit || 0) > 0
    );

    if (creditLine) {
      return String(creditLine?.Credit || creditLine?.credit || 0);
    }

    return "0.00";
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchId =
        filters.entryId === "" ||
        String(entry?.id || "").includes(filters.entryId);

      const matchDescription =
        filters.description === "" ||
        getDescription(entry)
          .toLowerCase()
          .includes(filters.description.toLowerCase());

      const matchReference =
        filters.reference === "" ||
        getReference(entry)
          .toLowerCase()
          .includes(filters.reference.toLowerCase());

      const matchAccount =
        filters.account === "" ||
        getAccountNames(entry)
          .toLowerCase()
          .includes(filters.account.toLowerCase());

      const matchAmount =
        filters.amount === "" ||
        getAmount(entry).includes(filters.amount);

      const matchCreatedBy =
        filters.createdBy === "" ||
        String(getCreatedBy(entry)).includes(filters.createdBy);

      const matchDate =
        filters.date === "" ||
        formatDateOnly(getEntryDate(entry)).includes(filters.date);

      return (
        matchId &&
        matchDescription &&
        matchReference &&
        matchAccount &&
        matchAmount &&
        matchCreatedBy &&
        matchDate
      );
    });
  }, [entries, filters]);

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <h1>Journal Entries</h1>

            <button
              onClick={() => setPopupOpen(true)}
              data-tooltip-id="tooltipA"
              data-tooltip-content="Help"
              data-tooltip-place="top"
            >
              Help
            </button>
          </div>
        </div>

        <div className="service-box">
          <h2>Select Service</h2>

          <button onClick={() => setService("pending")}>Pending</button>
          <button onClick={() => setService("approved")}>Approved</button>
          <button onClick={() => setService("rejected")}>Rejected</button>
        </div>

        <div className="filter-box">
          <input
            name="entryId"
            placeholder="Entry ID"
            value={filters.entryId}
            onChange={handleChange}
          />
          <input
            name="description"
            placeholder="Description"
            value={filters.description}
            onChange={handleChange}
          />
          <input
            name="reference"
            placeholder="Reference"
            value={filters.reference}
            onChange={handleChange}
          />
          <input
            name="account"
            placeholder="Account Name"
            value={filters.account}
            onChange={handleChange}
          />
          <input
            name="amount"
            placeholder="Amount"
            value={filters.amount}
            onChange={handleChange}
          />
          <input
            name="createdBy"
            placeholder="User ID"
            value={filters.createdBy}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
          />
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}
        {actionError && <p className="error-text">{actionError}</p>}
        {actionSuccess && <p className="success-text">{actionSuccess}</p>}

        {!loading && !error && (
          <table className="coa-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Description</th>
                <th>Reference</th>
                <th>Accounts</th>
                <th>Amount</th>
                <th>User</th>
                {service === "pending" && (role == 1 || role == 2) && (
                  <th>Action</th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{formatDateTime(getEntryDate(entry))}</td>
                    <td>{getDescription(entry) || "N/A"}</td>
                    <td>{getReference(entry) || "N/A"}</td>
                    <td>
                    {getLines(entry).length > 0 ? (
                        getLines(entry).map((line, index) => {
                        const accountId =
                            line.AccountID ||
                            line.account_id ||
                            line.accountId;

                        return (
                            <span
                            key={index}
                            style={{
                                cursor: "pointer",
                                color: "#007bff",
                                textDecoration: "underline",
                                marginRight: "6px",
                            }}
                            onClick={() => {
                                if (accountId) {
                                navigate(`/ledger/${accountId}`);
                                }
                            }}
                            >
                            {line.account_name || line.AccountName || "Account"}
                            </span>
                        );
                        })
                    ) : (
                        "N/A"
                    )}
                    </td>
                    <td>{formatMoney(getAmount(entry))}</td>
                    <td>{getCreatedBy(entry) || "N/A"}</td>

                    {service === "pending" && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="journal-action-cell">
                        <button onClick={() => navigate(`/journal/edit/${entry.id}`)}>
                          Edit
                        </button>

                        {(role == 1 || role == 2) && (
                          <>
                            <button onClick={() => handleApprove(entry.id)}>
                              Approve
                            </button>

                            <input
                              placeholder="Reason"
                              value={selectedReasons[entry.id] || ""}
                              onChange={(e) =>
                                handleReasonChange(entry.id, e.target.value)
                              }
                            />

                            <button onClick={() => handleReject(entry.id)}>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      service === "pending" && (role == 1 || role == 2) ? 8 : 7
                    }
                  >
                    No journal entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {isPopupOpen && (
          <div className="PopDiv">
            <h3>Help</h3>
            <p>View, filter, approve, and reject journal entries.</p>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalList;