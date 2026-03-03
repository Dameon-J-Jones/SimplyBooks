import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/welcome";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";

export default function App() {
  return (

      <Routes>
        {/* default route */}


        {/* pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* catch-all */}
        <Route path="*" element={<h1 style={{ color: "black" }}>404 Not Found</h1>} />
      </Routes>
 
  );
}