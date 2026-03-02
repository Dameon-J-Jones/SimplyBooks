import { useState } from "react";
import Logo from "../components/Logo";
import "./Page.css";

const CreateAccount = () => {
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [addr1, setaddr1] = useState("");
  const [addr2, setaddr2] = useState("");
  const [city, setcity] = useState("");
  const [state, setstate] = useState("");
  const [zip, setzip] = useState("");

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
        <text>First Name</text>
        {/* fName */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setfirstName(e.target.value)}
          required
        />
        <text>Last Name</text>
        {/* lName */}
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setlastName(e.target.value)}
          required
        />
        <text>Address Line 1</text>
        {/* Addr1 */}
        <input
          type="text"
          placeholder="Address 1"
          value={addr1}
          onChange={(e) => setaddr1(e.target.value)}
          required
        />
        <text>Address Line 2 (Optional)</text>
        {/* Addr2 */}
        <input
          type="text"
          placeholder="Address 2"
          value={addr2}
          onChange={(e) => setaddr2(e.target.value)}
          required
        />
        <text>City</text>
        {/* City */}
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setcity(e.target.value)}
          required
        />
        <text>State</text>
        {/* State */}
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setstate(e.target.value)}
          required
        />
        <text>Zip</text>
        {/* Zip */}
        <input
          type="text"
          placeholder="Zip"
          value={zip}
          onChange={(e) => setzip(e.target.value)}
          required
        />

        
        {/* Submit */}
        <button type="submit">Next</button>



  
      </form>
    </div>
  );
};

export default CreateAccount;


