import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
import LongLogo from "../components/LongLogo";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";
import "./HomePage.module.css";
import {useNavigate } from "react-router-dom";
import AccountInfo from "../components/AccountInfo";

const ManagerHomePage = () => {
const token = localStorage.getItem("token");
const [data, setData] = useState({})
const [isPopupOpen, setPopupOpen] = useState (false);
const navigate = useNavigate();

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

useEffect(()=>{
//verifyToken();
},[])

console.log(data)

const today = new Date();
const formatted = today.toLocaleDateString();
const username = "username";
  return (
    <div className="page">
      <Tooltip id="tooltipA"/>
      <section className="header">
      
              <h2 className="date">{formatted}</h2>
              <div className="logo"><LongLogo/></div>
              <AccountInfo username={username}/>
              
              </section>


      {/*Popup  Template*/}
      {isPopupOpen &&
      (      
        <div className="PopDiv">
          <p>
          Accountants can securely manage financial records, track transactions, generate reports, and oversee user accounts within the system.
          </p> 
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }


<div className="body">
  
  <h1>Manager</h1>
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
<button className="help-button" onClick={() => setPopupOpen(true)}>Help </button>
    </div>
</div>
  );
};

export default ManagerHomePage;