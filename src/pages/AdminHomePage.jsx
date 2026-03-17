import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import {useUser} from "../components/UserContext";
import styles from "./HomePage.module.css";

const AdminHomePage = () => {
  const {currentUser} = useUser();

return (
  <div className={styles.page}>
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
        <button type="button" className={styles.createUserButton}>
          View Users
        </button>
      </Link>
      <Link to="/create-account">
        <button type="button" className={styles.createUserButton}>
          Create New User
        </button>
      </Link>
    </div>
  </div>
);
};

export default AdminHomePage;
