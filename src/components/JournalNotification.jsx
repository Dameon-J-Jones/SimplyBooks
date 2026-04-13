import axios from "../api/axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function JournalNotification() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    getNotifications();
  }, []);

  async function getNotifications() {
    try {
      const response = await axios.get("/notifications/notifications", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

   
      setCount(response.data.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setCount(0);
    }
  }

  return (
    <div className="component">
      <h3>Notifications</h3>

      <p>
        You have <strong>{count}</strong> new Journal Entry{" "}
        <button onClick={() => navigate("/journal-list")}>
          View
        </button>
      </p>
    </div>
  );
}