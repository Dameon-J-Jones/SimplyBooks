import { useNavigate } from "react-router-dom";
import "./NavButtons.css";

export default function NavButtons(){ 
  const navigate = useNavigate();

  const role = Number(localStorage.getItem("role"));

  return (
    <div className="topnav">
      <button onClick={() => navigate("/login")}>Home</button>

      <button onClick={() => navigate("/accounts")}>
        Chart of Accounts
      </button>

      <button onClick={() => navigate("/EventLog")}>
        Event Log
      </button>

      <button onClick={() => navigate("/CreateJournalEntry")}>
        Journal Entry
      </button>

      <button onClick={() => navigate("/journal-list")}>
        Journal List
      </button>

      <button onClick={() => navigate("/UserList")}>
        Users
      </button>

      <button onClick={() => navigate("/journal/edit")}>
        Journal Edit
      </button>
      
      
      
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

