import { Link } from "react-router-dom"
import { useState, useContext } from "react";
import Logo from "../components/Logo";
import "./Login.css";
import LongLogo from "../components/LongLogo";
import Authcontext from "../components/AuthProvider";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from "react-tooltip";


const Login = () => {

  const navigate = useNavigate();
  const {setAuth} = useContext(Authcontext)
  const {setCurrentUser} = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isPopupOpen, setPopupOpen] = useState (false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post("/auth", {
      username,
      password
    });

    const { user, token } = response.data;

    if (!token) {
      alert("Login failed");
      return;
    }

    localStorage.setItem("token", token);
    setAuth({ user, token });
    setCurrentUser(user);

    const roleRoutes = {
      0: "/AccountantHome",
      1: "/ManagerHome",
      2: "/AdminHome"
    };

    
    if(user.status === 1) {navigate(roleRoutes[user.role] || "/");}
    else{
       alert("Status is inactive. Please wait for approval from admin.");
      return;
    }
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="page-margin">
      <div className="top-bar">
        <div className="logo"><Logo/></div>
        <text className="icon" id="initials"></text>
      </div>
      
    <div className="login-page">
      <Tooltip id="tooltipA"/>
      <form onSubmit={handleSubmit} className="login-form">
     
       {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit */}
        <button type="submit"
          data-tooltip-id="tooltipA"
          data-tooltip-content="Login"
          data-tooltip-place="top"
        >Login</button>

        {/* Extra actions */}
       
      </form>

      {/*Popup  Template*/}
      {isPopupOpen &&
      (
      <div className="PopDiv">
        <p>
          This screen allows the user to login by entering their
           username and password, then clicking the Login Button.
           If you've forgotten your password, click the "Forgot Password Button"
        </p> 
        <p>
          This screen also allows for a user to create an account by clicking
          the "create account" button
        </p>
        <button onClick={() => setPopupOpen(false)}>Close </button>
      </div>  
      )
      }
      <Link to="/forgot-password" >
          <button type="button" className="forgot-password-button" id="Forgot"
          data-tooltip-id="tooltipA"
          data-tooltip-content="Forgot Password"
          data-tooltip-place="top"
          >
            Forgot Password
          </button>
      </Link>

     

      <Link to="/create-account"
          data-tooltip-id="tooltipA"
          data-tooltip-content="Create Account"
          data-tooltip-place="top"
      >
          <button type="button" className="create-user-button">Create New User</button>
      </Link> 
      <br/>

      <button onClick={() => setPopupOpen(true)}>Help </button>
      


    </div>
    </div>
  );
};
export default Login;