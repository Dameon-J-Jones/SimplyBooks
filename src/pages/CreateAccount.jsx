import LongLogo from "../components/longLogo";
import "./CreateAccount.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {


   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userType: "Accountant",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    dob: "",
    securityAnswer: ""
  });

function checkPassword(password){
    const passwordRegex = /^[A-Za-z](?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{7,}$/;

if (!passwordRegex.test(password)) {
  alert("Password must be 8+ characters, start with a letter, and include a letter, number, and special character.");
  return false;
}

return true
}


  async function handleSubmit(e) {
  try {
    e.preventDefault();

    if(!checkPassword(formData.password)){
       setErrorMessage("Password must have 1 uppercase, 1 number, and 1 special character.");
      return;
    }


    const response = await fetch("http://localhost:3001/create-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert("Failed to create account");
      return;
    }

    console.log("User created:", data);

 setMessage("Account created successfully!");

// Wait 2 seconds, then go to login
setTimeout(() => {
  navigate("/login");
}, 2000);

  } catch (err) {
    console.error("Error creating account:", err);
    alert("Server error");
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

      <div className="create-account-container">
        <div className="buttons-container">
          <h1>Create New User</h1>
            {message && <div className="success-message">{message}</div>}
            { errorMessage && <div className="error-message">{errorMessage}</div>}
          <form className="create-form" onSubmit={handleSubmit}>
            {/* user type */}
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
               required
            >
              <option value="Accountant">Accountant</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>

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

            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username" required
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
            <button type="submit" className="submit-button">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </>
  );
}