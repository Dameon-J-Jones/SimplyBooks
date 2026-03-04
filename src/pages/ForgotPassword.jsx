import LongLogo from "../assets/LongLogo.png";
import "./ForgotPassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword(){
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleReset = () => {
    if (!userId || !email || !securityAnswer) {
      setError("Please fill out all fields before resetting your password.");
      return;
    }

    setError("");
    alert("Password reset request submitted. Redirecting to login..."); // placeholder
    
    navigate("/Login");
  };

    
return (
    <div className="forgot-wrapper">
      <img src={LongLogo} alt="App Logo" className="forgot-logo" />

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

        <button onClick={handleReset}>Reset Password</button>
      </div>
    </div>
  );
}






