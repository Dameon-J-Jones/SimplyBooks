import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // or removeItem("token")
    navigate("/login");
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;