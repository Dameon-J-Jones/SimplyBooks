import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./ChartOfAccounts.css";

// Page shows all accounts
// Users can filter accounts and click a row to open its ledger page

const ChartOfAccounts = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters the user can type into
  const [filters, setFilters] = useState({
    name: "",
    number: "",
    category: "",
    subcategory: "",
    amount: "",
  });

  const today = new Date();
  const formatted = today.toLocaleDateString();

  // placeholder for now 
  const username = "username";

  useEffect(() => {
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

  // extra filtering done on frontend 
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSub =
        filters.subcategory === "" ||
        (acc.subcategory || "")
          .toLowerCase()
          .includes(filters.subcategory.toLowerCase());

      const matchAmount =
        filters.amount === "" ||
        String(acc.balance ?? "").includes(filters.amount);

      return matchSub && matchAmount;
    });
  }, [accounts, filters.subcategory, filters.amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const goToLedger = (id) => {
    // requirement 11: click account -> go to ledger
    navigate(`/ledger/${id}`);
  };

  return (
    <div className="page">
      <section className="header">
        <h2 className="date">{formatted}</h2>
        <div className="logo">
          <LongLogo />
        </div>
        <AccountInfo username={username} />
      </section>

      <div className="coa-container">
        <h1>Chart of Accounts</h1>

        {/* filter inputs */}
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

          <button onClick={fetchAccounts}>
            Apply Filters
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <table className="coa-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Balance</th>
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
                    <td>{acc.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ChartOfAccounts;
