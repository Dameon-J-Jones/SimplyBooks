import LongLogo from "../components/LongLogo";
import "./CreateAccount.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { makeUsername } from "../utils/MakeUsername";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

export default function CreateAccount() {

  const userRef =useRef();
  const errRef = useRef();

   const [userFocus, setUserFocus] = useState(false) 
   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const navigate = useNavigate();
   const [isPopupOpen, setPopupOpen] = useState (false);

  const [formData, setFormData] = useState({
    userType: "Accountant",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    dob: "",
    securityAnswer: ""
  });



 //checks password to see if it meets rules 
function checkPassword(password){
    const passwordRegex = /^[A-Za-z](?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{7,}$/;

if (!passwordRegex.test(password)) {
  alert("Password must be 8+ characters, start with a letter, and include a letter, number, and special character.");
  return false;
}

return true
}


async function handleSubmit(e) {
  e.preventDefault();

  if (!checkPassword(formData.password)) {
    setErrorMessage(
      "Password must have 1 uppercase, 1 number, and 1 special character."
    );
    return;
  }

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
          <p>
            Manager type accounts are used by managers, and they feature
            multiple user management tools
          </p>
          <p>
            Administrator Type accounts feature high level moderation tools.
          </p>
          <p>
            After Selecting the account type and filling in the information fields
            Your request will be sent to an administrator for approval.          
          </p>
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }
        <div className="buttons-container">
          <h1>Create New User</h1>
            {message && <div className="success-message">{message}</div>}
            { errorMessage && <div className="error-message">{errorMessage}</div>}
          <form className="create-form" onSubmit={handleSubmit}>
            {/* user type */}
            <select
              name="userType"
              data-tooltip-id="tooltipA"
              data-tooltip-content="Choose The User Type For Your Account"
              data-tooltip-place="top"
              value={formData.userType}
              onChange={handleChange}
               required
               
            >
              <option value="Accountant">Accountant</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name" required
            />

            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name" required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password" required
            />

            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Cherry St" required
            />

            <label htmlFor="city">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City" required
            />

            <label htmlFor="state">State:</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="GA" required
            />

            <label htmlFor="zip">Zip Code:</label>
            <input
              type="number"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              placeholder="Zip Code" required
            />

            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="123-456-7890"
              required
            />

            <label htmlFor="dob">Date of Birth:</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange} required
            />

            <label htmlFor="securityAnswer">
              Security Question: What is your Mother's Maiden name?
            </label>
            <input
              type="text"
              id="securityAnswer"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={handleChange}
              placeholder="Answer" required
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