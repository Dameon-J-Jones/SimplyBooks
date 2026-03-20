import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./HomePage.css";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";


const AdminHomePage = () => {
const [isPopupOpen, setPopupOpen] = useState (false);

  return (
    <div className="page">
      <Tooltip id="tooltipA"/>
      <Logo />

            {/*Popup  Template*/}
      {isPopupOpen &&
      (      
        <div className="PopDiv">
          <p>
            As an administrator, you have access to certain administrative tools.
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

  );
};

export default AdminHomePage;
