import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../components/AuthProvider"; // adjust path

export default function RequireAuth({ children }) {
  const { auth } = useContext(AuthContext);

  if (!auth?.user) return <Navigate to="/login" replace />;
  return children;
}