import { useState } from "react";
import Logo from "../components/Logo";
import "./Page.css";

const CreateAccount2 = () => {
  const [dob, setDOB] = useState("");
  const [password, setPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  const [acctType, setAcctType] = useState("");
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
        <text>Create New Account</text>
        <text>Date Of Birth</text>
        {/* fName */}
        <input
          type="text"
          placeholder=""
          value={dob}
          onChange={(e) => setDOB(e.target.value)}
          required
        />
        <text>Password</text>
        {/* lName */}
        <input
          type="text"
          placeholder=""
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <text>Confirm Password</text>
        {/*confirm  */}
        <input
          type="text"
          placeholder=""
          value={conPassword}
          onChange={(e) => setConPassword(e.target.value)}
          required
        />
        <text>Account Type</text>
        {/* Addr2 */}
        <input
          type="text"
          placeholder=""
          value={acctType}
          onChange={(e) => setAcctType(e.target.value)}
          required
        />
        <text>Security Question</text>
        {/* City */}
        <input
          type="text"
          placeholder=""
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />


        
        {/* Submit */}
        <button type="submit">Create Account</button>


      </form>
    </div>
  );
};

export default CreateAccount2;