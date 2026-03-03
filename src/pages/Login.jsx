import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./Login.css";



const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    
   
  };

  return (
    <div className="page-margin">
      <div className="top-bar">
        <div className="top-left"><Logo/></div> <div className="top-right"><Logo/></div>
        <text className="icon" id="initials">AA</text>
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
        <button type="button">Forgot Password</button>

        

      </form>

      <Link to="/create-account">
          <button type="button" className="create-user-button">Create New User</button>
      </Link>

    </div>
    </div>
  );
};

export default Login;