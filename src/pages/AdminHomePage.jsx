import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./Login.css";

const AdminHomePage = () => {


  return (
    <div className="page">
      <Logo />


      <Link to="/create-account">
          <button type="button" className="create-user-button">Create New User</button>
      </Link>
            <Link to="/create-account">
          <button type="button" className="create-user-button">Create New User</button>
      </Link>

    </div>

  );
};

export default AdminHomePage;