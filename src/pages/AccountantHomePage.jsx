import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./HomePage.css";

const AccountantHomePage = () => {


  return (
    <div className="page">
      <Logo />


      <Link to="/UserList">
          <button type="button" className="create-user-button">View Users</button>
      </Link>
            <Link to="/create-account">
          <button type="button" className="create-user-button">Create New User</button>
      </Link>

    </div>

  );
};

export default AccountantHomePage;