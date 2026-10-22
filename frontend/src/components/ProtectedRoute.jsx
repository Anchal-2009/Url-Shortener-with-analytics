import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("linklyToken");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
