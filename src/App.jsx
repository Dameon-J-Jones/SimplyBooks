import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/welcome";
import CreateAccount from "./pages/CreateAccount";
import CreateAccount2 from "./pages/CreateAccount2";
import ForgotPassword from "./pages/ForgotPassword";
import AdminHomePage from "./pages/AdminHomePage";

export default function App() {
  return (

      <Routes>
        {/* default route */}


        {/* pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/create-account2" element={<CreateAccount2/>}/>
        <Route path="/ForgotPAssword" element={<ForgotPassword/>}/>
        <Route path="/AdminHomePage" element={<AdminHomePage/>}/>

        {/* catch-all */}
        <Route path="*" element={<h1 style={{ color: "black" }}>404 Not Found</h1>} />
      </Routes>
 
  );
}

