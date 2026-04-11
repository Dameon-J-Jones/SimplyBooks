import LongLogo from "../assets/LongLogo.png";
import "./ForgotPassword.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import axios from "axios";

function checkPassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

  if (!passwordRegex.test(password)) {
    return "Password must contain at least 1 uppercase letter, 1 number, and 1 special character.";
  }

  return "";
}

export default function ForgotPassword() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");
    setMessage("");

    if (!userId || !email || !securityAnswer) {
      setError("Please fill out all fields before resetting your password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/account/check-creds", {
        email,
        id: userId,
        securityQuestion: securityAnswer,
      });

      if (response.data.message === "Valid") {
        setMessage("Credentials verified. You can now reset your password.");
        setShowResetForm(true);
      } else {
        setShowResetForm(false);
        setError("Invalid Credentials");
      }
    } catch (err) {
      console.error(err);
      setShowResetForm(false);
      setError(err?.response?.data?.message || "Invalid Credentials");
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please fill out both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordError = checkPassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:3001/account/reset-password",
        {
          id: userId,
          password: password,
        }
      );

      console.log(response.data);
      setMessage("Password successfully reset!");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="forgot-wrapper">
      <Tooltip id="tooltipA" />
      <img src={LongLogo} alt="App Logo" className="forgot-logo" />

      {isPopupOpen && (
        <div className="PopDiv">
          <p>
            Enter your email, user ID, and security answer first. If correct,
            the password reset form will appear.
          </p>
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>
      )}

      <div className="forgot-card">
        <h2>{showResetForm ? "Reset Password" : "Forgot Password"}</h2>

        {message && <h3>{message}</h3>}
        {error && <p className="error">{error}</p>}

        {!showResetForm && (
          <div className="cred-section">
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
              placeholder="User ID"
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

            <button onClick={handleVerify}>Verify Credentials</button>
            <button onClick={() => setPopupOpen(true)}>Help</button>
          </div>
        )}

        {showResetForm && (
          <div className="reset-section">
            <div className="reset-form">
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

              <button onClick={handlePasswordReset}>
                Reset Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}