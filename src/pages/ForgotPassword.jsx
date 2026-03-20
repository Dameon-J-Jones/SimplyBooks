import LongLogo from "../assets/LongLogo.png";
import "./ForgotPassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

export default function ForgotPassword(){
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [isPopupOpen, setPopupOpen] = useState (false);

    const handleReset = () => {
    if (!userId || !email || !securityAnswer) {
      setError("Please fill out all fields before resetting your password.");
      return;
    }

    setError("");
    
    navigate("/password-reset");
  };

    
return (
    <div className="forgot-wrapper">
      <Tooltip id="tooltipA"/>
      <img src={LongLogo} alt="App Logo" className="forgot-logo" />
  
      {/*Popup  Template*/}
      {isPopupOpen &&
      (      
        <div className="PopDiv">
          <p>
            To reset your password, you must enter your email and user Name.
            In addition, you need to answer your security question.
          </p> 
          <button onClick={() => setPopupOpen(false)}>Close </button>
        </div>  
      )
      }
      <div className="forgot-card">
        <h2>Forgot Password</h2>

        {error && <p className="error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>User ID</label>
        <input
          type="text"
          placeholder="UserID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <label>What is your mother's maiden name?</label>
        <input
          type="text"
          placeholder="Security Question Answer"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
        />

        <button onClick={handleReset}
        data-tooltip-id="tooltipA"
          data-tooltip-content="Submit Request of Password Change"
          data-tooltip-place="top"
        >Reset Password</button>
            <button onClick={() => setPopupOpen(true)}>Help </button>
      </div>
      
    </div>
  );
}






