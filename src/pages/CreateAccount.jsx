import { useState } from "react";
import Logo from "../components/Logo";
import "./Page.css";

const CreateAccount = () => {
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ firstName, lastName });
    // TODO: send to backend, probably shouldn't put username and password in the console log
  };

  return (
    <div className="page">
      <Logo />

      <form onSubmit={handleSubmit} className="page-form">
        {/* fName */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setfirstName(e.target.value)}
          required
        />

        {/* lName */}
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setlastName(e.target.value)}
          required
        />
        {/* Addr1 */}
        <input
          type="text"
          placeholder="Last Name"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Addr2 */}
        <input
          type="text"
          placeholder="Last Name"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* City */}
        <input
          type="text"
          placeholder="Last Name"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* State */}
        <input
          type="text"
          placeholder="Last Name"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* Zip */}
        <input
          type="text"
          placeholder="Last Name"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit */}
        <button type="submit">Login</button>

        {/* Extra actions */}
        <button type="button">Forgot Password</button>
        <button type="button">Create New User</button>
      </form>
    </div>
  );
};

export default CreateAccount;