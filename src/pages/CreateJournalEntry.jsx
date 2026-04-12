import LongLogo from "../components/LongLogo";
import "./CreateJournal.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

export default function CreateJournalEntry() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);

  const [role, setRole] = useState("");
  const [data, setData] = useState({});

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
    } catch (error) {
      console.log("Invalid token " + error);
      navigate("/login");
    }
  }

  
  const fetchAccounts = async () => {
    try {
      const res = await axios.get("/account");
      setAccounts(res.data);
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  };

  useEffect(() => {
    verifyToken();
    fetchAccounts();
  }, []);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    if (Number(formData.debit) !== Number(formData.credit)) {
      setErrorMessage("Debit and Credit must match.");
      return;
    }

    if (!data?.user) {
      setErrorMessage("User not found. Please log in again.");
      return;
    }

    try {
      const payload = {
        entryDate: new Date().toISOString(),
        description: formData.description,
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

      console.log("Submitting:", payload);

      await axios.post("/journal/create", payload);

      setMessage("Journal Entry Submitted!");

      // reset form
      setFormData({
        description: "",
        debit: "",
        credit: "",
      });
      setDebitAccount("");
      setCreditAccount("");

    } catch (err) {
      console.error("FULL ERROR:", err.response?.data || err);
      setErrorMessage(
        err.response?.data?.message || "Failed to submit journal entry."
      );
    }
  }

  return (
    <>
      <div className="logo"><LongLogo /></div>
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
                        <option key={acc.id} value={acc.id}>
                          {acc.account_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
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
                        <option key={acc.id} value={acc.id}>
                          {acc.account_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
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

              </tbody>
            </table>

            <button type="submit" className="submit-button">
              Submit Journal Entry
            </button>
          </form>

          <button onClick={() => setPopupOpen(true)}>Help</button>
        </div>
      </div>
    </>
  );
}