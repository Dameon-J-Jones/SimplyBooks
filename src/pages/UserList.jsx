import { Link } from "react-router-dom"
import { useState } from "react";
import { useEffect } from "react";
import api from "../api/axios";
import Logo from "../components/Logo";
import "./UserList.css";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

const UserList = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [suspendDaysMap, setSuspendDaysMap] = useState({});
  const token = localStorage.getItem("token");
  const suspendUser = async (username, days) => {
    try{
      const untilDate = new Date();
      untilDate.setDate(untilDate.getDate() + days);

      await api.post("/admin/suspend",{username, suspendedUntil:untilDate,});

      // refresh users
      const response = await api.get("/users");
      setUsers(response.data);

      alert(`${username} suspended for ${days} day(s)`);

    } catch (err) {
      console.error(err);
    }
  };
async function verifyToken() {

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const response = await axios.get(
      "http://localhost:5000/accountant-access",
      {
        headers: {
           authorization: `Bearer ${token}`
        }
      }
    );

    console.log("User:", response.data);
    getData(response.data);

  } catch (error) {
    console.log("Invalid token");
    navigate("/login");
  }
}
  useEffect(() => {
    //verifyToken();
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  fetchUsers();
}, []);

return (
<div className="user-table-container">
      <div className="navBar">
        <Link to="/UserList">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="User List"
          data-tooltip-place="bottom"
          >User List</button>
        </Link>
        <Link to="/accounts">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="Chart of Accounts"
          data-tooltip-place="bottom"
          >Charts</button>
        </Link>
      </div>
  <table className="user-table">
    <thead>
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Address</th>
        <th>Role</th>
        <th>Status</th>
        <th>Created</th>
        <th>Suspend</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => {
        const groupMap = { 0: "Accountant", 1: "Manager", 2: "Admin" };
        const statusMap = { 0: "Pending", 1: "Approved", 2: "Rejected" };

        return (
          <tr key={user.UName}>
            <td>{user.UName}</td>
            <td>{user.Email}</td>
            <td>{user.Phone_Number}</td>
            <td>{user.address_line1}, {user.address_line2}</td>
            <td>{groupMap[user.GroupID]}</td>
            <td>{statusMap[user.status]}</td>
            <td>{new Date(user.created_on).toLocaleDateString()}</td>

            <td>
              <select
                value={suspendDaysMap[user.UName] || 7}
                onChange={(e) =>
                  setSuspendDaysMap({
                    ...suspendDaysMap,
                    [user.UName]: Number(e.target.value),
                  })
                }
              >
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>   
              </select>

              <button onClick={() => suspendUser(user.UName, suspendDaysMap[user.UName])}>
              Suspend
              </button>
            </td> 
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
);
};

export default UserList;