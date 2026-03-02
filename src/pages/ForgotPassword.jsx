import { useState } from "react";
import Logo from "../components/Logo";
import "./Page.css";

const ForgotPassword = () => {
  const [email, setEMail] = useState("");
  const [userID, setUserID] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ firstName, lastName });
    // TODO: send to backend, probably shouldn't put username and password in the console log
  };

  return (
    <div className="page">
      <Logo />

      <form onSubmit={handleSubmit} className="page-form">
        <text>Password Reset</text>
        <text>EMail</text>
        <input
          type="text"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEMail(e.target.value)}
          required
        />
        <text>User ID</text>
        <input
          type="text"
          placeholder=""
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          required
        />
        <text>Security Question</text>
        <input
          type="text"
          placeholder=""
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />


        
        {/* Submit */}
        <button type="submit">Reset Password</button>


      </form>
    </div>
  );
};

export default ForgotPassword;