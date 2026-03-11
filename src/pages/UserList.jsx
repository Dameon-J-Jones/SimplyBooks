import { Link } from "react-router-dom"
import { useState } from "react";
import { useEffect } from "react";
import api from "../api/axios";
import Logo from "../components/Logo";
import "./UserList.css";

const UserList = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState([]);

  useEffect(() => {
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
    <div className="page-margin">
      <div className="top-bar">
        <div className="logo"><Logo/></div>
        <span className="icon" id="initials"></span>
      </div>
      
    <div className="login-page">
    <ul>
      {users.map((user) => {

      const groupMap = { 0: "Accountant", 1: "Manager", 2: "Admin" }; //maps number returned from db to be a readable string
      const statusMap = { 0: "Pending", 1: "Approved", 2: "Rejected" }; //should eventually get this to a point where admins can easily change status of individual users

        return(
        <li key={user.UName}>
          {user.UName} | {user.Phone_Number} | {user.address_line1} | {user.address_line2} | {groupMap[user.GroupID]} | {statusMap[user.status]} | {user.created_on}
        </li>
        );
      })}
    </ul>

    </div>
    </div>

  );
};

export default UserList;