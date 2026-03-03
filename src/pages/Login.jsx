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
    <div className="login-page">
      <Logo />

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

  );
};

export default Login;