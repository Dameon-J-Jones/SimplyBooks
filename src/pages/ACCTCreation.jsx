import LongLogo from "../components/LongLogo";
import "./CreateAccount.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { makeUsername } from "../utils/MakeUsername";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

export default function ACCTCreation() {

  const userRef =useRef();
  const errRef = useRef();

   const [userFocus, setUserFocus] = useState(false) 
   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const navigate = useNavigate();
   const [isPopupOpen, setPopupOpen] = useState (false);

  const [formData, setFormData] = useState({
    acctType: "Asset",
    description: "Cash",
    acctNumber: "",
  });



 //checks password to see if it meets rules 



async function handleSubmit(e) {
  e.preventDefault();


  try {
    const username = makeUsername(formData.firstName, formData.lastName);

    // ensure all required fields are non-empty
    const payload = { ...formData, username };
    console.log("Sending payload:", payload); //debug line

    const response = await api.post("/users", payload);
    console.log("User created:", response.data);

    setMessage("Account created successfully!");
    setTimeout(() => navigate("/login"), 2000);
  } catch (err) {
    console.error("Error creating account:", err.response?.data || err);
    alert(err.response?.data?.message || "Server error");
  }
}

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  return (
    <>
      <div className="logo"><LongLogo /></div>
      <Tooltip id="tooltipA"/>
      <div className="create-account-container">
        {/*Popup  Template*/}
      {isPopupOpen &&
      (      
        <div className="PopDiv">
          <p>
            There are a few things you'll need to create an account.
            Firstly, you'll need to choose what type of account you wish
            to create. 
          </p> 
          <p>
            Accountant Type accounts are the accounts of the standard user.
            You'll have access to our main accounting services
          </p>
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }
        <div className="buttons-container">
          <h1>Create New Account</h1>
            {message && <div className="success-message">{message}</div>}
            { errorMessage && <div className="error-message">{errorMessage}</div>}
          <form className="create-form" onSubmit={handleSubmit}>
            {/* user type */}
            <select
              name="acctType"
              data-tooltip-id="tooltipA"
              data-tooltip-content="Choose The Type For Your Account"
              data-tooltip-place="top"
              value={formData.userType}
              onChange={handleChange}
               required
               
            >
              <option value="Asset">Asset</option>
              <option value="Equity">Equity</option>
              <option value="Expense">Expense</option>
              <option value="Liability">Liability</option>
            </select>

            <label htmlFor="email">Email:</label>
            <input
              type="description"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="cash"
              required
            />

            
            

            {/* submit */}
            <button type="submit" className="submit-button"
            data-tooltip-id="tooltipA"
            data-tooltip-content="Create Your Account"
            data-tooltip-place="top"
            >
              Create Account
            </button>
          </form>
          <button onClick={() => setPopupOpen(true)}>Help </button>
        </div>
      </div>
    </>
  );
}