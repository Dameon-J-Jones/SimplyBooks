import { useState } from "react";
import Logo from "../components/Logo";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ username, password });
    // TODO: send to backend, probably shouldn't put username and password in the console log
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
        <button type="button">Forgot Password</button>
        <button type="button">Create New User</button>
      </form>
    </div>
  );
};

export default Login;