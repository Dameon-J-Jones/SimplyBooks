import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./ChartOfAccounts.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const ChartOfAccounts = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addError, setAddError] = useState("");
  const [service, setService] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [role, setRole] = useState("");
  const token = localStorage.getItem("token");
  const [data, setData] = useState({});
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    name: "",
    number: "",
    category: "",
    subcategory: "",
    amount: "",
  });

  const [newAccount, setNewAccount] = useState({
    account_name: "",
    account_number: "",
    description: "",
    normal_side: "Debit",
    category: "",
    subcategory: "",
    initial_balance: "",
    debit: "",
    credit: "",
    user_id: "",
    account_order: "",
    statement: "",
    comment: "",
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

      const data = response.data;
      setRole(data.role);
      setData(data);
    } catch (error) {
      console.log("Invalid token" + error);
      navigate("/login");
    }
  }

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  useEffect(() => {
    verifyToken();
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/account", {
        params: {
          search: filters.name,
          number: filters.number,
          category: filters.category,
          subcategory: filters.subcategory,
          amount: filters.amount,
        },
      });

      setAccounts(response.data);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError("Could not load accounts.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchName =
        filters.name === "" ||
        String(acc.account_name || "")
          .toLowerCase()
          .includes(filters.name.toLowerCase());

      const matchNumber =
        filters.number === "" ||
        String(acc.account_number || "").includes(filters.number);

      const matchCategory =
        filters.category === "" ||
        String(acc.category || "")
          .toLowerCase()
          .includes(filters.category.toLowerCase());

      const matchSub =
        filters.subcategory === "" ||
        String(acc.subcategory || "")
          .toLowerCase()
          .includes(filters.subcategory.toLowerCase());

      const matchAmount =
        filters.amount === "" ||
        String(acc.balance ?? "").includes(filters.amount);

      return (
        matchName &&
        matchNumber &&
        matchCategory &&
        matchSub &&
        matchAmount
      );
    });
  }, [accounts, filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewAccountChange = (e) => {
    const { name, value } = e.target;

    setNewAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (
      !newAccount.account_name ||
      !newAccount.account_number ||
      !newAccount.category
    ) {
      setAddError("Please fill in account name, account number, and category.");
      return;
    }

    if (!newAccount.statement || newAccount.statement.trim() === "") {
      setAddError("Pick statement type.");
      return;
    }

    if (!data?.user) {
      setAddError("User ID not found. Please log in again.");
      return;
    }

    const num = Number(newAccount.account_number);

    if (!Number.isInteger(num)) {
      setAddError("Account number must be a whole number.");
      return;
    }

    if (
      (newAccount.category === "Asset" && (num < 1000 || num >= 2000)) ||
      (newAccount.category === "Liability" && (num < 2000 || num >= 3000)) ||
      (newAccount.category === "Equity" && (num < 3000 || num >= 4000)) ||
      (newAccount.category === "Revenue" && (num < 4000 || num >= 5000)) ||
      (newAccount.category === "Expense" && (num < 5000 || num >= 6000))
    ) {
      setAddError("Account number does not match category rules.");
      return;
    }

    try {
      await axios.post("/account", {
        account_name: newAccount.account_name,
        account_number: Number(newAccount.account_number),
        description: newAccount.description,
        normal_side: newAccount.normal_side,
        category: newAccount.category,
        subcategory: newAccount.subcategory,
        initial_balance: Number(newAccount.initial_balance || 0),
        debit: Number(newAccount.debit || 0),
        credit: Number(newAccount.credit || 0),
        user_id: data.user,
        account_order:
          newAccount.account_order === "" ? null : newAccount.account_order,
        statement: newAccount.statement,
        comment: newAccount.comment,
      });

      setAddSuccess("Account added successfully.");

      setNewAccount({
        account_name: "",
        account_number: "",
        description: "",
        normal_side: "Debit",
        category: "",
        subcategory: "",
        initial_balance: "",
        debit: "",
        credit: "",
        user_id: data.user,
        account_order: "",
        statement: "",
        comment: "",
      });

      fetchAccounts();
    } catch (err) {
      console.error("Error adding account:", err);
      setAddError(err.response?.data?.message || "Could not add account.");
    }
  };

  const handleStartEdit = (acc) => {
    setEditingId(acc.id);
    setService("add");
    setAddError("");
    setAddSuccess("");

    setNewAccount({
      account_name: acc.account_name || "",
      account_number: acc.account_number || "",
      description: acc.description || "",
      normal_side: acc.normal_side || "Debit",
      category: acc.category || "",
      subcategory: acc.subcategory || "",
      initial_balance: acc.initial_balance || "",
      debit: acc.debit || "",
      credit: acc.credit || "",
      user_id: data?.user || "",
      account_order: acc.account_order || "",
      statement: acc.statement || "",
      comment: acc.comment || "",
    });
  };

  const handleEditAccount = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!newAccount.statement || newAccount.statement.trim() === "") {
      setAddError("Pick statement type.");
      return;
    }

    if (!editingId) {
      setAddError("No account selected to edit.");
      return;
    }

    if (
      !newAccount.account_name ||
      !newAccount.account_number ||
      !newAccount.category
    ) {
      setAddError("Please fill in account name, account number, and category.");
      return;
    }

    const num = Number(newAccount.account_number);

    if (!Number.isInteger(num)) {
      setAddError("Account number must be a whole number.");
      return;
    }

    try {
      await axios.put(`/account/${editingId}`, {
        account_name: newAccount.account_name,
        account_number: Number(newAccount.account_number),
        description: newAccount.description,
        normal_side: newAccount.normal_side,
        category: newAccount.category,
        subcategory: newAccount.subcategory,
        initial_balance: Number(newAccount.initial_balance || 0),
        debit: Number(newAccount.debit || 0),
        credit: Number(newAccount.credit || 0),
        user_id: data.user,
        account_order:
          newAccount.account_order === "" ? null : newAccount.account_order,
        statement: newAccount.statement,
        comment: newAccount.comment,
      });

      setAddSuccess("Account updated successfully.");
      setEditingId(null);

      setNewAccount({
        account_name: "",
        account_number: "",
        description: "",
        normal_side: "Debit",
        category: "",
        subcategory: "",
        initial_balance: "",
        debit: "",
        credit: "",
        user_id: "",
        account_order: "",
        statement: "",
        comment: "",
      });

      setService("view");
      fetchAccounts();
    } catch (err) {
      console.error("Error updating account:", err);
      setAddError(err.response?.data?.message || "Could not update account.");
    }
  };

  const handleDeactivateAccount = async (id) => {
    setAddError("");
    setAddSuccess("");

    try {
      await axios.put(`/account/${id}/deactivate`, {
        user_id: data.user,
      });

      setAddSuccess("Account deactivated successfully.");
      fetchAccounts();
    } catch (err) {
      console.error("Error deactivating account:", err);

      if (err.response?.data?.message) {
        setAddError(err.response.data.message);
      } else {
        setAddError("Cannot deactivate account.");
      }
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

  const goToLedger = (id) => {
    navigate(`/ledger/${id}`);
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
  <h1>Chart of Accounts</h1>

  <button
    onClick={() => setPopupOpen(true)}
    data-tooltip-id="tooltipA"
    data-tooltip-content="Help"
    data-tooltip-place="top"
  >
    Help
  </button>
</div>

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
          <h2>Select Service</h2>

          {role == 2 && (
            <button
              onClick={() => setService("add")}
              data-tooltip-id="tooltipA"
              data-tooltip-content="Add a new account to the chart of accounts."
            >
              Add
            </button>
          )}

          {(role == 1 || role == 2 || role == 0) && (
            <button
              onClick={() => {
                setService("view");
                setEditingId(null);
                setAddError("");
                setAddSuccess("");
              }}
              data-tooltip-id="tooltipA"
              data-tooltip-content="View all accounts and click an account to open its ledger."
            >
              View
            </button>
          )}

          {role == 2 && (
            <button
              onClick={() => setService("edit")}
              data-tooltip-id="tooltipA"
              data-tooltip-content="Select an account and update its information."
            >
              Edit
            </button>
          )}

          {role == 2 && (
            <button
              onClick={() => setService("deactivate")}
              data-tooltip-id="tooltipA"
              data-tooltip-content="Deactivate an account so it is no longer active."
            >
              Deactivate
            </button>
          )}
        </div>

        {((service === "add" && role == 2) || (editingId && role == 2)) && (
          <div className="add-account-box">
            <h2>{editingId ? "Edit Account" : "Add Account"}</h2>

            <form
              onSubmit={editingId ? handleEditAccount : handleAddAccount}
              className="form-grid"
            >
              <div>
                <label>Account Name</label>
                <input
                  name="account_name"
                  value={newAccount.account_name}
                  onChange={handleNewAccountChange}
                />
              </div>

              <div>
                <label>Account Number</label>
                <input
                  name="account_number"
                  value={newAccount.account_number}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      handleNewAccountChange(e);
                    }
                  }}
                />
              </div>

              <div>
                <label>Account Description</label>
                <input
                  name="description"
                  value={newAccount.description}
                  onChange={handleNewAccountChange}
                />
              </div>

              <div>
                <label>Normal Side</label>
                <select
                  name="normal_side"
                  value={newAccount.normal_side}
                  onChange={handleNewAccountChange}
                >
                  <option value="Debit">Debit</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>

              <div>
                <label>Category</label>
                <select
                  name="category"
                  value={newAccount.category}
                  onChange={handleNewAccountChange}
                >
                  <option value="">Select Category</option>
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div>
                <label>Subcategory</label>
                <input
                  name="subcategory"
                  value={newAccount.subcategory}
                  onChange={handleNewAccountChange}
                />
              </div>

              <div>
                <label>Initial Balance</label>
                <input
                  name="initial_balance"
                  value={newAccount.initial_balance}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      handleNewAccountChange(e);
                    }
                  }}
                  onBlur={(e) => {
                    const formatted = formatMoney(e.target.value);
                    setNewAccount((prev) => ({
                      ...prev,
                      initial_balance: formatted,
                    }));
                  }}
                />
              </div>

              <div>
                <label>Debit</label>
                <input
                  name="debit"
                  value={newAccount.debit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      handleNewAccountChange(e);
                    }
                  }}
                  onBlur={(e) => {
                    const formatted = formatMoney(e.target.value);
                    setNewAccount((prev) => ({
                      ...prev,
                      debit: formatted,
                    }));
                  }}
                />
              </div>

              <div>
                <label>Credit</label>
                <input
                  name="credit"
                  value={newAccount.credit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      handleNewAccountChange(e);
                    }
                  }}
                  onBlur={(e) => {
                    const formatted = formatMoney(e.target.value);
                    setNewAccount((prev) => ({
                      ...prev,
                      credit: formatted,
                    }));
                  }}
                />
              </div>

              <div>
                <label>Account Order</label>
                <input
                  name="account_order"
                  value={newAccount.account_order}
                  onChange={handleNewAccountChange}
                />
              </div>

              <div>
                <label>Statement Type</label>
                <select
                  name="statement"
                  value={newAccount.statement}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, statement: e.target.value })
                  }
                >
                  <option value="">Select Statement Type</option>
                  <option value="Balance Sheet">Balance Sheet</option>
                  <option value="Income Statement">Income Statement</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label>Comment</label>
                <input
                  name="comment"
                  value={newAccount.comment}
                  onChange={handleNewAccountChange}
                />
              </div>

              <button
                type="submit"
                data-tooltip-id="tooltipA"
                data-tooltip-content={
                  editingId
                    ? "Save changes to the selected account."
                    : "Create a new account."
                }
              >
                {editingId ? "Update Account" : "Add Account"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNewAccount({
                      account_name: "",
                      account_number: "",
                      description: "",
                      normal_side: "Debit",
                      category: "",
                      subcategory: "",
                      initial_balance: "",
                      debit: "",
                      credit: "",
                      user_id: "",
                      account_order: "",
                      statement: "",
                      comment: "",
                    });
                  }}
                  data-tooltip-id="tooltipA"
                  data-tooltip-content="Cancel editing and clear the account form."
                >
                  Cancel Edit
                </button>
              )}
            </form>

            {addError && <p className="error-text">{addError}</p>}
            {addSuccess && <p className="success-text">{addSuccess}</p>}
          </div>
        )}

        {(
          (service === "" && (role == 0 || role == 1 || role == 2)) ||
          (service === "view" && (role == 0 || role == 1 || role == 2)) ||
          (service === "edit" && role == 2) ||
          (service === "deactivate" && role == 2)
        ) && (
          <>
            <div className="filter-box">
              <input
                name="name"
                placeholder="Account name"
                value={filters.name}
                onChange={handleChange}
              />
              <input
                name="number"
                placeholder="Account number"
                value={filters.number}
                onChange={handleChange}
              />
              <input
                name="category"
                placeholder="Category"
                value={filters.category}
                onChange={handleChange}
              />
              <input
                name="subcategory"
                placeholder="Subcategory"
                value={filters.subcategory}
                onChange={handleChange}
              />
              <input
                name="amount"
                placeholder="Amount"
                value={filters.amount}
                onChange={handleChange}
              />

              <button
                onClick={fetchAccounts}
                data-tooltip-id="tooltipA"
                data-tooltip-content="Apply the selected filters to the chart of accounts."
              >
                Apply Filters
              </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}
            {addError && <p className="error-text">{addError}</p>}
            {addSuccess && <p className="success-text">{addSuccess}</p>}

            {!loading && !error && (
              <table className="coa-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Number</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Balance</th>
                    {role == 2 &&
                      (service === "edit" || service === "deactivate") && (
                        <th>Action</th>
                      )}
                  </tr>
                </thead>

                <tbody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                      <tr
                        key={acc.id}
                        onClick={() => goToLedger(acc.id)}
                        className="clickable-row"
                        title="Click to view ledger"
                      >
                        <td>{acc.account_name}</td>
                        <td>{acc.account_number}</td>
                        <td>{acc.category}</td>
                        <td>{acc.subcategory || "N/A"}</td>
                        <td>{formatMoney(acc.balance)}</td>
                        {role == 2 &&
                          (service === "edit" || service === "deactivate") && (
                            <td onClick={(e) => e.stopPropagation()}>
                              {service === "edit" && role == 2 && (
                                <button
                                  onClick={() => handleStartEdit(acc)}
                                  data-tooltip-id="tooltipA"
                                  data-tooltip-content="Edit this account."
                                >
                                  Edit
                                </button>
                              )}

                              {service === "deactivate" && role == 2 && (
                                <button
                                  onClick={() => handleDeactivateAccount(acc.id)}
                                  data-tooltip-id="tooltipA"
                                  data-tooltip-content="Deactivate this account."
                                >
                                  Deactivate
                                </button>
                              )}
                            </td>
                          )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          service === "edit" || service === "deactivate" ? 6 : 5
                        }
                      >
                        No accounts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {isPopupOpen && (
          <div className="PopDiv">
            <h3>Help</h3>

            <p>
              The Chart of Accounts displays all accounts in the system and allows users to view, organize, and (for administrators) manage account information.
            </p>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartOfAccounts;