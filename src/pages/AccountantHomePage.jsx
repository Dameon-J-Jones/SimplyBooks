import { Link } from "react-router-dom"
import { useState } from "react";
import LongLogo from "../components/LongLogo";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";
import "./HomePage.module.css";
import "./AccountHomePage.css";
import AccountInfo from "../components/AccountInfo";


const AccountantHomePage = () => {
const [isPopupOpen, setPopupOpen] = useState (false);
const [selectedDate, setSelectedDate] = useState(null);

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






<div className="body">
      {/*Popup  Template*/}
      {isPopupOpen &&
      (      
        <div className="PopDiv">
          <p>
          
          </p> 
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }

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
     
<button onClick={() => setPopupOpen(true)}>Help </button>
    </div>
</div>
  );
};

export default AccountantHomePage;