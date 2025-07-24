import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!token) {
      navigate("/login");
      return;
    }

    if (role === "admin" && !location.pathname.startsWith("/admin")) {
      navigate("/admin");
    } else if (role === "superadmin" && !location.pathname.startsWith("/superadmin")) {
      navigate("/superadmin");
    }
  }, [token, role, loading, navigate, location.pathname]);

  return <>{children}</>;
};

export default ProtectedRoute;
