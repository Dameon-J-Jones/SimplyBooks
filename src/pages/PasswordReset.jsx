import LongLogo from "../assets/LongLogo.png";
import "./PasswordReset.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = () => {
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

        <button onClick={handleSubmit}>Reset Password</button>
      </div>
    </div>
  );
}