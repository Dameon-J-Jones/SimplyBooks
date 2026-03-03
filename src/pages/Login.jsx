import { Link } from "react-router-dom"
import { useState } from "react";
import Logo from "../components/Logo";
import "./Login.css";
import "../../backend/PasswordCheck.js"



const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Accountant");

  const handleSubmit = (e) => {
    e.preventDefault();
      //test username and password
           console.log({ username, password, userType});
           // TODO: send to backend, probably shouldn't put username and password in the console log
    
    
   
  };

  return (
    <div className="page-margin">
      <div className="top-bar">
        <div className="top-left"><Logo/></div> <div className="top-right"><Logo/></div>
        <text className="icon">ds</text>
      </div>
      
    <div className="login-page">
      

      <form onSubmit={handleSubmit} className="login-form">
      
      {/* UserType */}
       <select  className="user-type"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
         >
            <option value="Accountant">Accountant</option>
            <option value="Manager">Manager</option>
            <option value="Administrator">Administrator</option>

        </select>
      
      
      
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