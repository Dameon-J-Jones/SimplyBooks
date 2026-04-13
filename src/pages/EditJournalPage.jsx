import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./ChartOfAccounts.css";
import "./EditJournalPage.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const emptyLine = {
  accountId: "",
  debit: "",
  credit: "",
  description: "",
};

const EditJournalEntry = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState("");
  const [data, setData] = useState({});
  const [isPopupOpen, setPopupOpen] = useState(false);

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    entryDate: "",
    description: "",
    referenceNumber: "",
    lines: [{ ...emptyLine }, { ...emptyLine }],
  });

  const [originalForm, setOriginalForm] = useState(null);

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
      return true;
    } catch (error) {
      console.log("Invalid token " + error);
      navigate("/login");
      return false;
    }
  }

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("/account", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError("Could not load accounts.");
    }
  };

  const fetchJournal = async () => {
    try {
      const response = await axios.get(`/journal/${id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const entry = response.data?.journalEntry || {};
      const lines = Array.isArray(response.data?.lines) ? response.data.lines : [];

      const normalizedForm = {
        entryDate: entry?.EntryDate
          ? new Date(entry.EntryDate).toISOString().split("T")[0]
          : "",
        description: entry?.Description || "",
        referenceNumber: entry?.ReferenceNumber || "",
        lines:
          lines.length > 0
            ? lines.map((line) => ({
                accountId: String(line?.AccountID || ""),
                debit: String(line?.Debit || ""),
                credit: String(line?.Credit || ""),
                description: String(line?.Description || ""),
              }))
            : [{ ...emptyLine }, { ...emptyLine }],
      };

      setFormData(normalizedForm);
      setOriginalForm(normalizedForm);
    } catch (err) {
      console.error("Error loading journal:", err);
      setError("Could not load journal entry.");
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const ok = await verifyToken();
      if (ok) {
        await fetchAccounts();
        await fetchJournal();
      }
      setLoading(false);
    };

    initPage();
  }, [id]);

  const handleTopLevelChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLineChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedLines = [...prev.lines];
      updatedLines[index] = {
        ...updatedLines[index],
        [field]: value,
      };

      return {
        ...prev,
        lines: updatedLines,
      };
    });
  };

  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { ...emptyLine }],
    }));
  };

  const removeLine = (index) => {
    setFormData((prev) => {
      if (prev.lines.length <= 2) return prev;

      return {
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index),
      };
    });
  };

  const handleReset = () => {
    if (originalForm) {
      setFormData(originalForm);
    }
    setError("");
    setSuccess("");
  };

  const totalDebit = formData.lines.reduce(
    (sum, line) => sum + Number(line.debit || 0),
    0
  );

  const totalCredit = formData.lines.reduce(
    (sum, line) => sum + Number(line.credit || 0),
    0
  );

  const formatMoney = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const validateForm = () => {
    if (!formData.entryDate) {
      setError("Entry date is required.");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return false;
    }

    if (!formData.referenceNumber.trim()) {
      setError("Reference number is required.");
      return false;
    }

    if (!Array.isArray(formData.lines) || formData.lines.length < 2) {
      setError("A journal entry must have at least two lines.");
      return false;
    }

    let hasDebit = false;
    let hasCredit = false;

    for (let i = 0; i < formData.lines.length; i++) {
      const line = formData.lines[i];
      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);

      if (!line.accountId) {
        setError(`Line ${i + 1}: account is required.`);
        return false;
      }

      if (debit > 0 && credit > 0) {
        setError(`Line ${i + 1}: cannot have both debit and credit.`);
        return false;
      }

      if (debit <= 0 && credit <= 0) {
        setError(`Line ${i + 1}: enter a debit or credit amount.`);
        return false;
      }

      if (debit > 0) hasDebit = true;
      if (credit > 0) hasCredit = true;
    }

    if (!hasDebit) {
      setError("At least one debit line is required.");
      return false;
    }

    if (!hasCredit) {
      setError("At least one credit line is required.");
      return false;
    }

    if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
      setError("Total debits must equal total credits.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      await axios.put(
        `/journal/${id}/edit`,
        {
          entryDate: formData.entryDate,
          description: formData.description.trim(),
          referenceNumber: formData.referenceNumber.trim(),
          createdBy: data.user,
          lines: formData.lines.map((line) => ({
            accountId: Number(line.accountId),
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0),
          })),
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Journal entry updated and sent back for approval.");
      setTimeout(() => {
        navigate("/journal-list");
      }, 1000);
    } catch (err) {
      console.error("Error updating journal:", err);
      setError(err.response?.data?.message || "Could not update journal entry.");
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

      <NavButtons />

      <div className="coa-container edit-journal-lowered">
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
            <h1>Edit Journal Entry</h1>

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
          <h2>Journal Actions</h2>

          <button
            onClick={addLine}
            data-tooltip-id="tooltipA"
            data-tooltip-content="Add a new journal line."
          >
            Add Line
          </button>

          <button
            onClick={handleReset}
            data-tooltip-id="tooltipA"
            data-tooltip-content="Reset the journal form back to original values."
          >
            Reset
          </button>

          <button
            onClick={() => navigate("/journal-list")}
            data-tooltip-id="tooltipA"
            data-tooltip-content="Cancel editing and return to journal list."
          >
            Cancel
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        {!loading && (
          <form onSubmit={handleSubmit}>
            <div className="add-account-box">
              <h2>Journal Information</h2>

              <div className="form-grid">
                <div>
                  <label>Entry Date</label>
                  <input
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleTopLevelChange}
                  />
                </div>

                <div>
                  <label>Reference Number</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleTopLevelChange}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleTopLevelChange}
                  />
                </div>
              </div>
            </div>

            <table className="coa-table edit-journal-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Line Description</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {formData.lines.map((line, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={line.accountId}
                        onChange={(e) =>
                          handleLineChange(index, "accountId", e.target.value)
                        }
                      >
                        <option value="">Select Account</option>
                        {accounts.map((acc) => (
                          <option
                            key={acc.id || acc.account_id}
                            value={acc.id || acc.account_id}
                          >
                            {acc.account_number
                              ? `${acc.account_number} - ${acc.account_name}`
                              : acc.account_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit}
                        onChange={(e) =>
                          handleLineChange(index, "debit", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit}
                        onChange={(e) =>
                          handleLineChange(index, "credit", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(index, "description", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="edit-journal-totals-box">
              <p>
                <strong>Total Debit:</strong> {formatMoney(totalDebit)}
              </p>
              <p>
                <strong>Total Credit:</strong> {formatMoney(totalCredit)}
              </p>
            </div>

            <div className="edit-journal-submit-row">
              <button type="submit">Submit Edited Journal</button>
            </div>
          </form>
        )}

        {isPopupOpen && (
          <div className="PopDiv">
            <h3>Help</h3>
            <p>
              Edit the selected journal entry here. After saving, the journal
              will be sent back for approval or rejection.
            </p>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditJournalEntry;