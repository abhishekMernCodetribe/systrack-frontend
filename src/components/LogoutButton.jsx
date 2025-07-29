import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-blue-700 hover:text-indigo-600 transition font-medium cursor-pointer"
    >
      LOGOUT
    </button>
  );
};

export default LogoutButton;
