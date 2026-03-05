import { Link } from "react-router-dom"
import { useState, useContext } from "react";
import Logo from "../components/Logo";
import "./Login.css";
import LongLogo from "../components/longLogo";
import Authcontext from "../components/AuthProvider";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";






const LOGIN_URL = '/auth'

const Login = () => {

  const navigate = useNavigate();
  const {setAuth} =useContext(Authcontext)



  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log("SUBMIT", { username, password });

  try {
    const response = await api.post("/users/login", {
      username,
      password
    });

    const { user, token } = response.data;

    //keep signed in after refresh
    if (token) localStorage.setItem("token", token);

    //app-wide auth state
    setAuth({ user, token });


    // go to home
    navigate("/AdminHome"); // change if your route is different
  } catch (err) {
    console.error(err);
  alert(err.response?.data?.message || "Login failed");
  }
  }


  return (
    <div className="page-margin">
      <div className="top-bar">
        <div className="logo"><Logo/></div>
        <text className="icon" id="initials"></text>
      </div>
      
    <div className="login-page">
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
        <button type="submit">Login</button>

        {/* Extra actions */}
       
      </form>
      
      <Link to="/forgot-password" >
       <button type="button" className="forgot-password-button">Forgot Password</button>
      </Link>

      <Link to="/create-account">
          <button type="button" className="create-user-button">Create New User</button>
      </Link>

    </div>
    </div>
  );
};
export default Login;