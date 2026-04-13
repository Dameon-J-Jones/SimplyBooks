import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./Ledger.css";
import "./ChartOfAccounts.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const Ledger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [entries, setEntries] = useState([]);
  const [data, setData] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({
    date: "",
    startDate: "",
    endDate: "",
    accountName: "",
    amount: "",
  });

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  const formatMoney = (value) => {
    const num = Number(String(value ?? 0).replace(/,/g, ""));
    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  async function verifyToken() {
    if (!token) {
      navigate("/login");
      return false;
    }

    try {
      const response = await axios.get("/admin/all-access", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;
      setData(userData);
      setIsAuthorized(true);
      return true;
    } catch {
      navigate("/login");
      return false;
    }
  }

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      setError("");

      const [accountRes, ledgerRes] = await Promise.all([
        axios.get(`/account/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`/journal/ledger/${id}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setAccount(accountRes.data);
      setEntries(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
    } catch (err) {
      console.error("Error loading ledger:", err);
      setError("Could not load ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      const ok = await verifyToken();
      if (ok) {
        await fetchLedgerData();
      } else {
        setLoading(false);
      }
    };

    initPage();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ledgerRows = useMemo(() => {
    if (!account) return [];

    const normalSide = String(account.normal_side || "Debit").toLowerCase();
    const initialBalance = Number(account.initial_balance || 0);

    const mappedRows = entries.map((entry, index) => {
      const debit = Number(entry.Debit || entry.debit || 0);
      const credit = Number(entry.Credit || entry.credit || 0);

      return {
        ...entry,
        rowId: entry.id || `${index}-${entry.ReferenceNumber || "row"}`,
        debit,
        credit,
      };
    });

    const filteredRows = mappedRows.filter((entry) => {
      const entryDateValue = entry.EntryDate ? new Date(entry.EntryDate) : null;
      const entryDateOnly =
        entryDateValue && !isNaN(entryDateValue.getTime())
          ? entryDateValue.toLocaleDateString("en-CA")
          : "";

      const singleDateMatch =
        filters.date === "" || entryDateOnly === filters.date;

      const startDateMatch =
        filters.startDate === "" ||
        (entryDateValue &&
          !isNaN(entryDateValue.getTime()) &&
          entryDateValue >= new Date(filters.startDate));

      const endDateMatch =
        filters.endDate === "" ||
        (entryDateValue &&
          !isNaN(entryDateValue.getTime()) &&
          entryDateValue <= new Date(`${filters.endDate}T23:59:59`));

      const accountNameMatch =
        filters.accountName === "" ||
        String(account.account_name || "")
          .toLowerCase()
          .includes(filters.accountName.toLowerCase());

      const search = filters.amount.trim();

      const amountMatch =
        search === "" ||
        formatMoney(entry.debit).includes(search) ||
        formatMoney(entry.credit).includes(search);

      return (
        singleDateMatch &&
        startDateMatch &&
        endDateMatch &&
        accountNameMatch &&
        amountMatch
      );
    });

    const sortedRows = [...filteredRows].sort((a, b) => {
      const aIsDebit = a.debit > 0;
      const bIsDebit = b.debit > 0;
      const aIsCredit = a.credit > 0;
      const bIsCredit = b.credit > 0;

      if (aIsDebit && bIsCredit) return -1;
      if (aIsCredit && bIsDebit) return 1;
      return 0;
    });

    let runningBalance = initialBalance;

    return sortedRows.map((entry) => {
      if (normalSide === "debit") {
        runningBalance += entry.debit - entry.credit;
      } else {
        runningBalance += entry.credit - entry.debit;
      }

      return {
        ...entry,
        runningBalance,
      };
    });
  }, [entries, account, filters]);

  const displayedCurrentBalance = useMemo(() => {
    if (ledgerRows.length > 0) {
      return ledgerRows[ledgerRows.length - 1].runningBalance;
    }
    return Number(account?.initial_balance || 0);
  }, [ledgerRows, account]);

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
        <h1 style={{ marginBottom: "20px" }}>Ledger</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && account && isAuthorized && (
          <>
            <div
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "16px" }}>
                Account Information
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                <div>
                  <strong>Name:</strong>
                  <div>{account.account_name ?? "N/A"}</div>
                </div>

                <div>
                  <strong>Number:</strong>
                  <div>{account.account_number ?? "N/A"}</div>
                </div>

                <div>
                  <strong>Description:</strong>
                  <div>{account.description || "N/A"}</div>
                </div>

                <div>
                  <strong>Normal Side:</strong>
                  <div>{account.normal_side || "N/A"}</div>
                </div>

                <div>
                  <strong>Category:</strong>
                  <div>{account.category ?? "N/A"}</div>
                </div>

                <div>
                  <strong>Subcategory:</strong>
                  <div>{account.subcategory || "N/A"}</div>
                </div>

                <div>
                  <strong>Initial Balance:</strong>
                  <div>${formatMoney(account.initial_balance)}</div>
                </div>

                <div>
                  <strong>Current Balance:</strong>
                  <div>${formatMoney(displayedCurrentBalance)}</div>
                </div>

                <div>
                  <strong>Status:</strong>
                  <div>
                    {account.is_active === false ? "Inactive" : "Active"}
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-box">
              <div className="filter-group">
                <label>Exact Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-group">
                <label>Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  placeholder="Search account"
                  value={filters.accountName}
                  onChange={handleChange}
                />
              </div>

              <div className="filter-group">
                <label>Amount</label>
                <input
                  type="text"
                  name="amount"
                  placeholder="Search amount"
                  value={filters.amount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <table className="coa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {ledgerRows.length > 0 ? (
                  ledgerRows.map((entry) => (
                    <tr key={entry.rowId}>
                      <td>
                        {entry.EntryDate
                          ? new Date(entry.EntryDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {entry.ReferenceNumber ? (
                          <button
                            type="button"
                            className="pr-link-button"
                            onClick={() =>
                              navigate(`/journal/${entry.journal_entry_id}`)
                            }
                          >
                            {entry.ReferenceNumber}
                          </button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{entry.Description || "N/A"}</td>
                      <td>${formatMoney(entry.debit)}</td>
                      <td>${formatMoney(entry.credit)}</td>
                      <td>${formatMoney(entry.runningBalance)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No ledger transactions found</td>
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

export default Ledger;