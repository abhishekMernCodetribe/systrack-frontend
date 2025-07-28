import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./components/Home";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import SuperAdmin from "./components/SuperAdmin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SystemListPage from "./dashboard/SystemListPage";
import EmployeeList from "./dashboard/EmployeeList";
import PartsList from "./dashboard/PartsList";
import BarcodeScanner from "./dashboard/BarcodeScanner";

const App = () => {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/superadmin"
            element={
              <ProtectedRoute>
                <SuperAdmin />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="systems" element={<SystemListPage />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="parts" element={<PartsList />} />
            <Route path="barcode" element={<BarcodeScanner />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
