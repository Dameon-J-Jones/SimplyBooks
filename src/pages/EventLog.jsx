import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import LongLogo from "../components/LongLogo";
import AccountInfo from "../components/AccountInfo";
import "./ChartOfAccounts.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import NavButtons from "../components/NavButtons";

const EventLog = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [data, setData] = useState({});
  const [service, setService] = useState("view");
  const [isPopupOpen, setPopupOpen] = useState(false);

  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({
    action: "",
    user_id: "",
    account_id: "",
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
    } catch (err) {
      console.log("Invalid token " + err);
      navigate("/login");
    }
  }

  const today = new Date();
  const formatted = today.toLocaleDateString();
  const username = data.username || "username";

  useEffect(() => {
    verifyToken();
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/journal/event-log", {
        params: {
          eventType: filters.action,
          performedBy: filters.user_id,
          recordId: filters.account_id,
          date: filters.date,
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading event logs:", err);
      setError("Could not load event logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getField = (obj, keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return null;
  };

  const parseMaybeJson = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "object") return value;

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  };

  const getEventLogId = (log) =>
    getField(log, ["id", "EventLogID", "eventLogId"]) || "N/A";

  const getAction = (log) =>
    getField(log, ["EventType", "eventType", "action"]) || "N/A";

  const getUserId = (log) =>
    getField(log, ["PerformedBy", "performedBy", "user_id"]) || "N/A";

  const getPerformedAt = (log) =>
    getField(log, ["PerformedAt", "performedAt", "created_at"]);

  const getBeforeImage = (log) =>
    parseMaybeJson(
      getField(log, ["OldValues", "oldValues", "before_data", "beforeData"])
    );

  const getAfterImage = (log) =>
    parseMaybeJson(
      getField(log, ["NewValues", "newValues", "after_data", "afterData"])
    );

  const getAccountId = (log) => {
    const beforeImage = getBeforeImage(log);
    const afterImage = getAfterImage(log);

    const id =
      getField(log, ["RecordID", "recordId", "AccountID", "accountId", "account_id"]) ||
      getField(afterImage, ["id", "ID", "AccountID", "accountId", "account_id"]) ||
      getField(beforeImage, ["id", "ID", "AccountID", "accountId", "account_id"]) ||
      getField(afterImage?.journal, ["id", "ID"]) ||
      getField(beforeImage?.journal, ["id", "ID"]) ||
      getField(afterImage?.journalEntry, ["id", "ID"]) ||
      getField(beforeImage?.journalEntry, ["id", "ID"]);

    return id ?? "N/A";
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

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const renderNestedValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span>N/A</span>;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return <span>{String(value)}</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {value.map((item, index) => (
            <div
              key={index}
              style={{
                paddingLeft: "10px",
                borderLeft: "2px solid #ddd",
              }}
            >
              <strong>Item {index + 1}</strong>
              {renderNestedValue(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {Object.entries(value).map(([k, v]) => (
            <div key={k}>
              <strong>{formatLabel(k)}:</strong> {renderNestedValue(v)}
            </div>
          ))}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  const renderImageData = (value, emptyText) => {
    if (!value) return <span>{emptyText}</span>;
    return renderNestedValue(value);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchAction =
        filters.action === "" ||
        String(getAction(log))
          .toLowerCase()
          .includes(filters.action.toLowerCase());

      const matchUser =
        filters.user_id === "" ||
        String(getUserId(log)).includes(filters.user_id);

      const matchAccount =
        filters.account_id === "" ||
        String(getAccountId(log)).includes(filters.account_id);

      const matchDate =
        filters.date === "" ||
        formatDateOnly(getPerformedAt(log)).includes(filters.date);

      return matchAction && matchUser && matchAccount && matchDate;
    });
  }, [logs, filters]);

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
          <h1>Event Log</h1>

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

          {(role == 0 || role == 1 || role == 2) && (
            <button
              onClick={() => setService("view")}
              data-tooltip-id="tooltipA"
              data-tooltip-content="View all event logs."
            >
              View
            </button>
          )}
        </div>

        {service === "view" && (
          <>
            <div className="filter-box">
              <input
                name="action"
                placeholder="Action"
                value={filters.action}
                onChange={handleChange}
              />
              <input
                name="user_id"
                placeholder="User ID"
                value={filters.user_id}
                onChange={handleChange}
              />
              <input
                name="account_id"
                placeholder="Account ID"
                value={filters.account_id}
                onChange={handleChange}
              />
              <input
                name="date"
                placeholder="Date"
                value={filters.date}
                onChange={handleChange}
              />

              <button
                onClick={fetchLogs}
                data-tooltip-id="tooltipA"
                data-tooltip-content="Apply filters to the event log."
              >
                Apply Filters
              </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && (
              <table className="coa-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Action</th>
                    <th>Account ID</th>
                    <th>User ID</th>
                    <th>Date / Time</th>
                    <th>Before Image</th>
                    <th>After Image</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <tr key={getEventLogId(log) || index}>
                        <td>{getEventLogId(log)}</td>
                        <td>{getAction(log)}</td>
                        <td>{getAccountId(log)}</td>
                        <td>{getUserId(log)}</td>
                        <td>{formatDateTime(getPerformedAt(log))}</td>
                        <td>{renderImageData(getBeforeImage(log), "No before image")}</td>
                        <td>{renderImageData(getAfterImage(log), "No after image")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No event logs found</td>
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
              The Event Log displays account and journal change history,
              including the action taken, the user who made the change,
              the date and time, and the before and after images.
            </p>
            <button onClick={() => setPopupOpen(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventLog;