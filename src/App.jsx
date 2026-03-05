import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/welcome";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import AdminHomePage from "./pages/AdminHomePage";
import ManagerHomePage from "./pages/ManagerHomePage";
import AccountantHomePage from "./pages/AccountantHomePage";
import UserList from "./pages/UserList";
import RequireAuth from "./components/RequireAuth";
export default function App() {
  return (

      <Routes>
        {/* default route */}


        {/* pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/AdminHome" element={<AdminHomePage/>}/>
        <Route path="/ManagerHomePage" element={<ManagerHomePage/>}/>
        <Route path="/AccountantHomePage" element={<AccountantHomePage/>}/>
        <Route path="/UserList" element={<UserList/>}/>

        {/* catch-all */}
        <Route path="*" element={<h1 style={{ color: "black" }}>404 Not Found</h1>} />
      </Routes>
 
  );
}