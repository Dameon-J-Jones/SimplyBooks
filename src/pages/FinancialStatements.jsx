import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import NavButtons from "../components/NavButtons";
import "./ChartOfAccounts.css";
import "./FinancialStatements.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

const FinancialStatements = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reportType, setReportType] = useState("trial-balance");
  const [reportData, setReportData] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");

  const [filters, setFilters] = useState({
    exactDate: "",
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("token");

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

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
      setRole(userData.role);
      setData(userData);
      setEmailTo(userData.email || "");
      return true;
    } catch (error) {
      console.log("Invalid token " + error);
      navigate("/login");
      return false;
    }
  }

  useEffect(() => {
    const initPage = async () => {
      setPageLoading(true);
      const ok = await verifyToken();
      setPageLoading(false);
      return ok;
    };

    initPage();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDateParams = () => {
    if (filters.exactDate) {
      return {
        startDate: filters.exactDate,
        endDate: filters.exactDate,
      };
    }

    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  };

  const fetchReport = async (selectedType = reportType) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setReportData(null);

      const response = await axios.get(`/reports/${selectedType}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
        params: getDateParams(),
      });

      setReportData(response.data);
      setSuccess("Report generated successfully.");
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Could not load financial statement.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError("");
    setSuccess("");
    await fetchReport(reportType);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    if (!reportData) {
      setError("Generate a report before emailing.");
      setSuccess("");
      return;
    }

    if (!emailTo.trim()) {
      setError("Enter an email address first.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post(
        "/reports/email",
        {
          to: emailTo,
          reportType,
          filters,
          reportData,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Report emailed successfully.");
    } catch (err) {
      console.error("Error emailing report:", err);
      setError(err.response?.data?.message || "Could not email report.");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    const num = Number(value || 0);
    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const trialRows = Array.isArray(reportData) ? reportData : [];
  const incomeRows = Array.isArray(reportData) ? reportData : [];
  const balanceRows = Array.isArray(reportData) ? reportData : [];

  const totalTrialDebits = trialRows.reduce(
    (sum, row) => sum + Number(row.total_debit || 0),
    0
  );

  const totalTrialCredits = trialRows.reduce(
    (sum, row) => sum + Number(row.total_credit || 0),
    0
  );

  const revenueRows = incomeRows.filter((row) => row.category === "Revenue");
  const expenseRows = incomeRows.filter((row) => row.category === "Expense");

  const totalRevenue = revenueRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const totalExpense = expenseRows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const netIncome = totalRevenue - totalExpense;

  const assetRows = balanceRows.filter((row) => row.category === "Asset");
  const liabilityRows = balanceRows.filter((row) => row.category === "Liability");
  const equityRows = balanceRows.filter((row) => row.category === "Equity");

  const totalAssets = assetRows.reduce(
    (sum, row) => sum + Number(row.balance || 0),
    0
  );

  const totalLiabilities = liabilityRows.reduce(
    (sum, row) => sum + Number(row.balance || 0),
    0
  );

  const totalEquity = equityRows.reduce(
    (sum, row) => sum + Number(row.balance || 0),
    0
  );

  const retainedEarnings = Number(reportData?.retained_earnings || 0);

  const buildReportHtml = () => {
    const generatedAt = new Date().toLocaleString();

    const exactDateText = filters.exactDate?.trim() ? filters.exactDate : "N/A";
    const startDateText = filters.startDate?.trim() ? filters.startDate : "N/A";
    const endDateText = filters.endDate?.trim() ? filters.endDate : "N/A";

    let content = "";

    if (reportType === "trial-balance" && Array.isArray(reportData)) {
      content = `
        <h2>Trial Balance</h2>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            ${reportData
              .map(
                (row) => `
                  <tr>
                    <td>${row.account_name || row.AccountName || "N/A"}</td>
                    <td>$${formatMoney(row.total_debit)}</td>
                    <td>$${formatMoney(row.total_credit)}</td>
                  </tr>
                `
              )
              .join("")}
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>$${formatMoney(totalTrialDebits)}</strong></td>
              <td><strong>$${formatMoney(totalTrialCredits)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (reportType === "income-statement" && Array.isArray(reportData)) {
      content = `
        <h2>Income Statement</h2>

        <h3>Revenue</h3>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${revenueRows
              .map(
                (row) => `
                  <tr>
                    <td>${row.account_name || "N/A"}</td>
                    <td>$${formatMoney(row.amount)}</td>
                  </tr>
                `
              )
              .join("")}
            <tr>
              <td><strong>Total Revenue</strong></td>
              <td><strong>$${formatMoney(totalRevenue)}</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>Expenses</h3>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRows
              .map(
                (row) => `
                  <tr>
                    <td>${row.account_name || "N/A"}</td>
                    <td>$${formatMoney(row.amount)}</td>
                  </tr>
                `
              )
              .join("")}
            <tr>
              <td><strong>Total Expense</strong></td>
              <td><strong>$${formatMoney(totalExpense)}</strong></td>
            </tr>
            <tr>
              <td><strong>Net Income</strong></td>
              <td><strong>$${formatMoney(netIncome)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (reportType === "balance-sheet" && Array.isArray(reportData)) {
      const buildSection = (title, rows, totalLabel, totalValue) => `
        <h3>${title}</h3>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${row.account_name || "N/A"}</td>
                    <td>$${formatMoney(row.balance)}</td>
                  </tr>
                `
              )
              .join("")}
            <tr>
              <td><strong>${totalLabel}</strong></td>
              <td><strong>$${formatMoney(totalValue)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;

      content = `
        <h2>Balance Sheet</h2>
        ${buildSection("Assets", assetRows, "Total Assets", totalAssets)}
        ${buildSection("Liabilities", liabilityRows, "Total Liabilities", totalLiabilities)}
        ${buildSection("Equity", equityRows, "Total Equity", totalEquity)}
        <table>
          <tbody>
            <tr>
              <td><strong>Total Liabilities + Equity</strong></td>
              <td><strong>$${formatMoney(totalLiabilities + totalEquity)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (reportType === "retained-earnings" && reportData) {
      content = `
        <h2>Retained Earnings Statement</h2>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Retained Earnings</td>
              <td>$${formatMoney(reportData.retained_earnings)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      content = `<p>No report data available.</p>`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Financial Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #222;
              padding: 30px;
              line-height: 1.4;
            }
            h1, h2, h3 {
              margin-bottom: 10px;
            }
            .meta {
              margin-bottom: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #f3f3f3;
            }
            .report-type {
              text-transform: capitalize;
            }
          </style>
        </head>
        <body>
          <h1>Financial Report</h1>

          <div class="meta">
            <p><strong>Report Type:</strong> <span class="report-type">${reportType}</span></p>
            <p><strong>Generated:</strong> ${generatedAt}</p>

            <h3>Filters</h3>
            <p><strong>Exact Date:</strong> ${exactDateText}</p>
            <p><strong>Start Date:</strong> ${startDateText}</p>
            <p><strong>End Date:</strong> ${endDateText}</p>
          </div>

          ${content}
        </body>
      </html>
    `;
  };

  const handleSave = () => {
    if (!reportData) {
      setError("Generate a report before saving.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");

    const html = buildReportHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
    setSuccess("Report saved successfully.");
  };

  const renderTrialBalance = () => {
    if (!Array.isArray(reportData)) return null;

    return (
      <table className="coa-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {reportData.length > 0 ? (
            <>
              {reportData.map((row) => (
                <tr key={row.id}>
                  <td>{row.account_name || row.AccountName || "N/A"}</td>
                  <td>${formatMoney(row.total_debit)}</td>
                  <td>${formatMoney(row.total_credit)}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${formatMoney(totalTrialDebits)}</strong></td>
                <td><strong>${formatMoney(totalTrialCredits)}</strong></td>
              </tr>
            </>
          ) : (
            <tr>
              <td colSpan="3">No trial balance data found</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderIncomeStatement = () => {
    if (!Array.isArray(reportData)) return null;

    return (
      <div className="statement-section">
        <h2>Revenue</h2>
        <table className="coa-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {revenueRows.length > 0 ? (
              <>
                {revenueRows.map((row, index) => (
                  <tr key={`rev-${index}`}>
                    <td>{row.account_name || "N/A"}</td>
                    <td>${formatMoney(row.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Revenue</strong></td>
                  <td><strong>${formatMoney(totalRevenue)}</strong></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="2">No revenue accounts found</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2>Expenses</h2>
        <table className="coa-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenseRows.length > 0 ? (
              <>
                {expenseRows.map((row, index) => (
                  <tr key={`exp-${index}`}>
                    <td>{row.account_name || "N/A"}</td>
                    <td>${formatMoney(row.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Expense</strong></td>
                  <td><strong>${formatMoney(totalExpense)}</strong></td>
                </tr>
                <tr>
                  <td><strong>Net Income</strong></td>
                  <td><strong>${formatMoney(netIncome)}</strong></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="2">No expense accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!Array.isArray(reportData)) return null;

    return (
      <div className="statement-section">
        <h2>Assets</h2>
        <table className="coa-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {assetRows.length > 0 ? (
              <>
                {assetRows.map((row, index) => (
                  <tr key={`asset-${index}`}>
                    <td>{row.account_name || "N/A"}</td>
                    <td>${formatMoney(row.balance)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Assets</strong></td>
                  <td><strong>${formatMoney(totalAssets)}</strong></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="2">No asset accounts found</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2>Liabilities</h2>
        <table className="coa-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {liabilityRows.length > 0 ? (
              <>
                {liabilityRows.map((row, index) => (
                  <tr key={`liab-${index}`}>
                    <td>{row.account_name || "N/A"}</td>
                    <td>${formatMoney(row.balance)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Liabilities</strong></td>
                  <td><strong>${formatMoney(totalLiabilities)}</strong></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="2">No liability accounts found</td>
              </tr>
            )}
          </tbody>
        </table>

        <h2>Equity</h2>
        <table className="coa-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {equityRows.length > 0 ? (
              <>
                {equityRows.map((row, index) => (
                  <tr key={`eq-${index}`}>
                    <td>{row.account_name || "N/A"}</td>
                    <td>${formatMoney(row.balance)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Equity</strong></td>
                  <td><strong>${formatMoney(totalEquity)}</strong></td>
                </tr>
                <tr>
                  <td><strong>Total Liabilities + Equity</strong></td>
                  <td><strong>${formatMoney(totalLiabilities + totalEquity)}</strong></td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="2">No equity accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRetainedEarnings = () => {
    return (
      <table className="coa-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Retained Earnings</td>
            <td>${formatMoney(retainedEarnings)}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderReport = () => {
    if (!reportData) return null;

    if (reportType === "trial-balance") return renderTrialBalance();
    if (reportType === "income-statement") return renderIncomeStatement();
    if (reportType === "balance-sheet") return renderBalanceSheet();
    if (reportType === "retained-earnings") return renderRetainedEarnings();

    return null;
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <h1>Financial Statements</h1>

          <button
            onClick={() => setPopupOpen(true)}
            data-tooltip-id="tooltipA"
            data-tooltip-content="Help"
            data-tooltip-place="top"
          >
            Help
          </button>
        </div>

        <div className="service-box">
          <h2>Select Statement</h2>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="financial-select"
          >
            <option value="trial-balance">Trial Balance</option>
            <option value="income-statement">Income Statement</option>
            <option value="balance-sheet">Balance Sheet</option>
            <option value="retained-earnings">Retained Earnings</option>
          </select>

          <button onClick={handleGenerate}>Generate</button>
          <button onClick={handleSave}>Save</button>
          <button onClick={handlePrint}>Print</button>
        </div>

        <div className="filter-box">
          <div className="filter-group">
            <label>Exact Date</label>
            <input
              type="date"
              name="exactDate"
              value={filters.exactDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>Email To</label>
            <input
              type="email"
              name="emailTo"
              placeholder="Enter email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Email Report</label>
            <button type="button" onClick={handleEmail}>
              Send Email
            </button>
          </div>
        </div>

        {pageLoading && <p>Loading...</p>}
        {loading && <p>Loading report...</p>}
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        {!pageLoading && !loading && !error && renderReport()}

        {isPopupOpen && (
          <div className="PopDiv">
            <h3>Help</h3>
            <p>
              This page lets you generate, view, save, email, and print the
              Trial Balance, Income Statement, Balance Sheet, and Retained
              Earnings Statement for a single date or a date range.
            </p>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialStatements;