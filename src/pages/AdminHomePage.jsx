import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./HomePage.css";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";




import {useUser} from "../components/UserContext";
import styles from "./HomePage.module.css";

const AdminHomePage = () => {
  const {currentUser} = useUser();
const [isPopupOpen, setPopupOpen] = useState (false);
return (
  <div className={styles.page}>
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



    
    {/* Top bar */}
    <div className={styles.topBar}>
      <Logo className={styles.logo} />

      {currentUser && (
        <div className={styles.userInfo}>
          <span>{currentUser.username}</span>
          <img
            src={currentUser.profilePic || "/default-pfp.png"}
            alt="Profile"
            className={styles.userPfp}
          />
        </div>
      )}
    </div>

    {/* Page content below the fixed top bar */}
    <div className={styles.pageContent}>
      <Link to="/UserList">
        <button type="button" className={styles.createUserButton}
                  data-tooltip-id="tooltipA"
          data-tooltip-content="View A List Of Current Users"
          data-tooltip-place="top">
          View Users
        </button>
      </Link>
      <Link to="/create-account">
        <button type="button" className={styles.createUserButton}
                  data-tooltip-id="tooltipA"
          data-tooltip-content="Create A New User"
          data-tooltip-place="top"
        >
          Create New User
        </button>
      </Link>
            <button onClick={() => setPopupOpen(true)}>Help </button>
    </div>
  </div>
);
};

export default AdminHomePage;
