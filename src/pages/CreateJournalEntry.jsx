import LongLogo from "../components/LongLogo";
import "./CreateJournal.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { makeUsername } from "../utils/MakeUsername";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

export default function CreateJournalEntry() {

  const userRef =useRef();
  const errRef = useRef();
  
   const [userFocus, setUserFocus] = useState(false) 
   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const navigate = useNavigate();
   const [isPopupOpen, setPopupOpen] = useState (false);

     const today = new Date();
  const formatted = today.toLocaleDateString();

  const [formData, setFormData] = useState({
    debACCT: "Cash",
    credACCT: "ACCT Recievable",
    description: "",
    debit: "",
  });
  const [acctVal, setACCTVal] = useState('');
  let accts = [
    {label:"one", value:"one"},
    {label:"two", value:"two"}
    ];
  const [acctPick, setACCTPick] = useState('');
  const [acctPick2, setACCTPick2] = useState('');  
  const handleACCTChange = (e) => {
    setACCTPick(e.target.value);
  }
    const handleACCTChange2 = (e) => {
    setACCTPick2(e.target.value);
  }
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

    setMessage("Journal Entry Submitted!");
    setTimeout(() => navigate("/login"), 2000);
  } catch (err) {
    console.error("Error submitting Journal:", err.response?.data || err);
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
            
          </p>
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }
        <div className="buttons-container">
          <h1>Add New Journal Entry</h1>
            {message && <div className="success-message">{message}</div>}
            { errorMessage && <div className="error-message">{errorMessage}</div>}
          <form className="create-form" onSubmit={handleSubmit}>
            <table>
            {/*Row one, Main Header*/}
            <tr>
                <td>Journal</td>
                <td>Page</td>
            </tr>
            {/*Row Two, Column Headers*/}
            <tr>
                <td className="tDate"><text>Date</text></td>
                <td className="tACCT"><text>Account</text></td>
                <td className="Blank"></td>
                <td className="tDebit"><text>Debits</text></td>
                <td className="tCredit"><text>Credits</text></td>
            </tr>
            {/*Row Three, Debit Line*/}
            <tr>
                <td><text>{formatted}</text></td>
                <td>
                <select
                name="debACCT"
                data-tooltip-id="tooltipA"
                data-tooltip-content="Choose an Account to Debit"
                data-tooltip-place="top"
                value={acctVal}
                onChange={handleACCTChange}
                required
                >
                    <option value="SelectAccount">Select Account</option>
                    {
                        accts.map((acctPick) => (
                            <option value={acctPick.value}>{acctPick.label}</option>
                        ))}
                </select>
                </td>
                <td>

                    
                </td>
                <td>
                    <input
                    type="text"
                    id="debit"
                    name="debit"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Debit" required
                    />
                </td>
                <td><text></text></td>
            </tr>

            <tr>
                <td><text></text></td>
                <td>
                <select
                name="credACCT"
                data-tooltip-id="tooltipA"
                data-tooltip-content="Choose The User Type For Your Account"
                data-tooltip-place="top"
                value={acctVal}
                onChange={handleACCTChange2}
                required
                >
                    <option value="SelectAccount">Select Account</option>
                    {
                        accts.map((acctPick) => (
                            <option value={acctPick.value}>{acctPick.label}</option>
                        ))}
                </select>
                </td>
                <td>

                    
                </td>
                <td><text></text></td>
                <td>
                    <input
                    type="text"
                    id="credit"
                    name="credit"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="credit" required
                    />
                </td>
                
            </tr>
            <tr>
                <td></td>
                <td>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.email}
              onChange={handleChange}
              placeholder="Description of Service"
              required
            />
                </td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            </table>







            {/* submit */}
            <button type="submit" className="submit-button"
            data-tooltip-id="tooltipA"
            data-tooltip-content="Submit Journal Entry"
            data-tooltip-place="top"
            >
              Submit Journal Entry
            </button>
          </form>
          <button onClick={() => setPopupOpen(true)}>Help </button>
        </div>
      </div>
    </>
  );
}