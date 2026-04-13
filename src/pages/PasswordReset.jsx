import LongLogo from "../assets/LongLogo.png";
import "./PasswordReset.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";
import axios from "axios";

function checkPassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

  if (!passwordRegex.test(password)) {
    alert(
      "Password must contain at least 1 uppercase letter, 1 number, and 1 special character."
    );
    return false;
  }

  return true;
}

export default function PasswordReset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [isPopupOpen, setPopupOpen] = useState (false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill out both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!checkPassword(password)) {
      return;
    }


    setError("");
    alert("Password successfully reset!");

    navigate("/Login");
  };

  return (
    <div className="reset-wrapper">
      <Tooltip id="tooltipA"/>
            {/*Popup  Template*/}
      {isPopupOpen &&
      (      
        <div className="PopDiv">
          <p>
            To reset your password, you must enter your email and user Name.
            In addition, you need to answer your security question.
          </p> 
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }
    <img src={LongLogo} alt="App Logo" className="reset-logo" />
      <div className="reset-card">
        <h2>Reset Password</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleSubmit}
        data-tooltip-id="tooltipA"
          data-tooltip-content="Reset Password"
          data-tooltip-place="top"
        >Reset Password</button>
      </div>
      <button onClick={() => setPopupOpen(true)}>Help </button>
    </div>
  );
}