import LongLogo from "../components/LongLogo";
import "./CreateJournal.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { makeUsername } from "../utils/MakeUsername";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";

export default function TrialBalance() {

  const userRef =useRef();
  const errRef = useRef();
  
   const [userFocus, setUserFocus] = useState(false) 
   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const navigate = useNavigate();
   const [isPopupOpen, setPopupOpen] = useState (false);
   const [accounts, setAccounts] = useState([]);

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


   const fetchAccounts = async () => {
     try {
       setLoading(true);
       setError("");
 
        const response = await axios.get("/account", {
         params: {
           search: filters.name,
           number: filters.number,
           category: filters.category,
         },
        });
       setAccounts(response.data);
     } catch (err) {
       console.error("Error loading accounts:", err);
       setError("Could not load accounts.");
     } finally {
       setLoading(false);
     }
   };



async function handleSubmit(e) {
  e.preventDefault();


  try {
    //Status of submitted journal entries is "p" for pending.
    const status = "p";

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
    useEffect(() => {
    //verifyToken();
    fetchAccounts();
  }, []);

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
            This is the page to create an individual Journal Entry
          </p>
          <p>
            When entering Debits and credits, make sure that each is in the correct column.
          </p>
          <button onClick={() => setPopupOpen(false)}>Close</button>
        </div>  
      )
      }
        <div className="buttons-container">
          <h1>Trial Balance</h1>
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
                <td className="tACCT"><text>Account</text></td>
                <td className="Blank"></td>
                <td className="tDebit"><text>Debits</text></td>
                <td className="tCredit"><text>Credits</text></td>
            </tr>
            {/*Row Three, Debit Line*/}
            {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <tr
                    key={acc.id}
                  >
                    <td>{acc.account_name}</td>
                    <td></td>
                    <td>{acc.category}</td>
                    <td>{acc.subcategory || "N/A"}</td>
                    <td>{acc.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No accounts found</td>
                </tr>
              )}

            <tr>
                <td className="tACCT"><text>Account</text></td>
                <td className="Blank"></td>
                <td className="tDebit"><text>Debits</text></td>
                <td className="tCredit"><text>Credits</text></td>
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