import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";
import "./HomePage.module.css";
import { Navigate } from "react-router-dom";

const ManagerHomePage = () => {
  const token = localStorage.get("token");
  useEffect(()=>{

  },[])

  function checkAuth(){
    if(token === null)
    {
      alert("You are not Logged in")
      Navigate('http://localhost:5173//login');
    }
  }

  return (
    <div className="page">
      <Tooltip id="tooltipA"/>
      <Logo />


      <Link to="/UserList">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="View The Current List Of Users"
          data-tooltip-place="top"
          >View Users</button>
      </Link>
            <Link to="/create-account">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="Create A New User"
          data-tooltip-place="top"
          >Create New User</button>
      </Link>

    </div>

  );
};

export default ManagerHomePage;