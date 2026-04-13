import LongLogo from "../components/LongLogo";
import "./CreateJournal.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

export default function CreateJournalEntry() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [data, setData] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    description: "",
    debit: "",
    credit: "",
  });

  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");

  const today = new Date();
  const formatted = today.toLocaleDateString();

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
    } catch (error) {
      console.log("Invalid token " + error);
      navigate("/login");
      return false;
    }
  }

  const fetchAccounts = async () => {
    try {
      const res = await axios.get("/account", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setErrorMessage("Could not load accounts.");
    }
  };

  useEffect(() => {
    const initPage = async () => {
      const ok = await verifyToken();
      if (ok) {
        await fetchAccounts();
      }
    };

    initPage();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  }

  function handleReset() {
    setFormData({
      description: "",
      debit: "",
      credit: "",
    });
    setDebitAccount("");
    setCreditAccount("");
    setSelectedFile(null);
    setErrorMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMessage("");
    setMessage("");

    if (!debitAccount || !creditAccount) {
      setErrorMessage("Please select both debit and credit accounts.");
      return;
    }

    if (!formData.debit || !formData.credit) {
      setErrorMessage("Enter debit and credit amounts.");
      return;
    }

    if (Number(formData.debit) <= 0 || Number(formData.credit) <= 0) {
      setErrorMessage("Debit and credit amounts must be greater than 0.");
      return;
    }

    if (Number(formData.debit) !== Number(formData.credit)) {
      setErrorMessage("Debit and Credit must match.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Description is required.");
      return;
    }

    if (!data?.user) {
      setErrorMessage("User not found. Please log in again.");
      return;
    }

    try {
      const payload = {
        entryDate: new Date().toISOString(),
        description: formData.description.trim(),
        referenceNumber: "REF-" + Date.now(),
        createdBy: data.user,
        lines: [
          {
            accountId: Number(debitAccount),
            debit: Number(formData.debit),
            credit: 0,
          },
          {
            accountId: Number(creditAccount),
            debit: 0,
            credit: Number(formData.credit),
          },
        ],
      };

      const journalRes = await axios.post("/journal/create", payload, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const journalEntryID =
        journalRes?.data?.journalEntryID ||
        journalRes?.data?.journalId ||
        journalRes?.data?.id;

      if (!journalEntryID) {
        throw new Error("Journal created but no journal id was returned.");
      }

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        await axios.post(`/journal/${journalEntryID}/upload`, uploadData, {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await axios.post(
        "/notifications/create",
        {
          user_id: data.user,
          message: "New Journal Entry added!",
          journalEntryID,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      handleReset();
      setMessage("Journal Entry Submitted!");
    } catch (err) {
      console.error("FULL ERROR:", err.response?.data || err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit journal entry."
      );
    }
  }

  return (
    <>
      <div className="logo">
        <LongLogo />
      </div>

      <Tooltip id="tooltipA" />
      <NavButtons />

      <div className="create-account-container">
        {isPopupOpen && (
          <div className="PopDiv">
            <p>Create a journal entry using valid accounts.</p>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        )}

        <div className="buttons-container">
          <h1>Add New Journal Entry</h1>

          {message && <div className="success-message">{message}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {isAuthorized && (
            <form className="create-form" onSubmit={handleSubmit}>
              <table>
                <tbody>
                  <tr>
                    <td>Date</td>
                    <td>{formatted}</td>
                  </tr>

                  <tr>
                    <td>Debit Account</td>
                    <td>
                      <select
                        value={debitAccount}
                        onChange={(e) => setDebitAccount(e.target.value)}
                        required
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
                        name="debit"
                        value={formData.debit}
                        onChange={handleChange}
                        placeholder="Debit"
                        required
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>Credit Account</td>
                    <td>
                      <select
                        value={creditAccount}
                        onChange={(e) => setCreditAccount(e.target.value)}
                        required
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
                        name="credit"
                        value={formData.credit}
                        onChange={handleChange}
                        placeholder="Credit"
                        required
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>Description</td>
                    <td colSpan="2">
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description"
                        required
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>Attachment</td>
                    <td colSpan="2">
                      <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <button type="button" onClick={handleReset}>
                Reset
              </button>

              <button type="submit" className="submit-button">
                Submit Journal Entry
              </button>
            </form>
          )}

          <br />

          <button onClick={() => setPopupOpen(true)}>Help</button>
        </div>
      </div>
    </>
  );
}