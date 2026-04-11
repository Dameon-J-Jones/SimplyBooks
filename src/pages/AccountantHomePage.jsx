import { Link } from "react-router-dom"
import { useState, useEffect} from "react";
import LongLogo from "../components/LongLogo";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";
import "./HomePage.module.css";
import "./AccountHomePage.css";
import AccountInfo from "../components/AccountInfo";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AccountantHomePage = () => {
const [isPopupOpen, setPopupOpen] = useState (false);
const token = localStorage.getItem("token");
const [data, setData] = useState({})

const navigate = useNavigate();

async function verifyToken() {

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const response = await axios.get("http://localhost:3001/admin/accountant-access",
      {
        headers: {
           authorization: `Bearer ${token}`
        }
      }
    );
    console.log(response.data)   
    setData(response.data);
     

  } catch (error) {
    console.log(error);
    navigate("/login");
  }
}

useEffect(() => {
  verifyToken();
}, []);


const today = new Date();
const formatted = today.toLocaleDateString();
const username = data.username || "username";

  return (
    <div className="page">

      <Tooltip id="tooltipA"/>




       <section className="header" >

        <h2 className="date">{formatted}</h2>
        <div className="logo"><LongLogo/></div>
        <AccountInfo username={username}/>
        
        </section>

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
      <h1>Accountant</h1>
      <Link to="/UserList">
          <button type="button" className="create-user-button"
          data-tooltip-id="tooltipA"
          data-tooltip-content="View A List Of Current Users"
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

export default AccountantHomePage;