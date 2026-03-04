import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./UserList.css";

const UserList = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  {/* This will be a list of imported user info */}
  const listOfUsers = ["John", "Jane", "Jimmy"];

  return (
    <div className="page-margin">
      <div className="top-bar">
        <div className="logo"><Logo/></div>
        <text className="icon" id="initials"></text>
      </div>
      
    <div className="login-page">
      <ul>
        {listOfUsers.map((user, index) =>(
          <li key={index}>{user}</li>
        ))}
      </ul>


    </div>
    </div>

  );
};

export default UserList;