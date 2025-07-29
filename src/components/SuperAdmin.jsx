import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LogoutButton from "./LogoutButton";
import { useEmployees } from '../context/EmployeeContext.jsx';
import { useSystems } from '../context/SystemContext.jsx';
import { useParts } from '../context/PartsContext.jsx';
import { FaBars, FaComputer } from "react-icons/fa6";
import { HiMiniCpuChip } from "react-icons/hi2";
import { BsFillPeopleFill } from "react-icons/bs";

const SuperAdmin = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    const [componentLoading, setComponentLoading] = useState(true);
    const { token, role, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { setEmployees } = useEmployees();
    const { setSystems } = useSystems();
    const { setParts } = useParts();

    useEffect(() => {
        if (loading) return;
        if (!token) {
            navigate("/login");
            return;
        }

        const verifySuperAdmin = async () => {
            try {
                const res = await axios.get(
                    `${baseURL}/api/users/superadmin`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );

                if (res.status === 200 && res.data.role === "superadmin") {
                    setAuthorized(true);
                } else {
                    navigate("/unauthorized");
                }
            } catch (err) {
                if ([401, 403].includes(err.response?.status)) {
                    localStorage.clear();
                    navigate("/login");
                } else {
                    console.error("Verification failed:", err);
                }
            } finally {
                setComponentLoading(false);
            }
        };

        verifySuperAdmin();
    }, [token, role, loading, navigate]);

    if (loading || componentLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-xl font-medium text-gray-600 animate-pulse">
                    Verifying superadmin access...
                </h1>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h1 className="text-2xl font-semibold text-red-500">
                    Unauthorized access
                </h1>
                <LogoutButton/>
            </div>
        );
    }

    const getAllEmployee = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/employee/allemployee`);
            setEmployees(res.data.employees);
        } catch (error) {
            console.error(`Error fetching Employees:`, error)
        }
    }

    const getAllParts = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/part`);
            setParts(res.data.parts);
        } catch (error) {
            console.error(`Error fetching parts:`, error)
        }
    }

    const getAllSystems = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/system/allsys`);
            setSystems(res.data.systems);
        } catch (error) {
            console.error(`Error fetching parts:`, error)
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Mobile toggle button */}
            <div className="sm:hidden absolute top-4 left-4 z-50">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-white bg-gray-800 p-2 rounded"
                >
                    <FaBars />
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed sm:static top-0 left-0 h-[100vh] md:h-auto w-64 bg-gray-800 text-white p-6 flex flex-col z-40 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
                    }`}
            >
                <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                    Super Admin
                </h2>


                <nav className="flex flex-col gap-4">
                    <NavLink
                        to="/superadmin/systems"
                        onClick={() => {
                            getAllSystems();
                            setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-sm px-4 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-blue-600 font-semibold" : ""
                            }`
                        }
                    >
                        <FaComputer className="text-lg" />
                        <span>Systems</span>
                    </NavLink>

                    <NavLink
                        to="/superadmin/parts"
                        onClick={() => {
                            getAllParts();
                            setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-sm px-4 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-blue-600 font-semibold" : ""
                            }`
                        }
                    >
                        <HiMiniCpuChip className="text-lg" />
                        <span>Parts</span>
                    </NavLink>
                    <NavLink
                        to="/superadmin/employees"
                        onClick={() => {
                            getAllEmployee();
                            setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-sm px-4 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-blue-600 font-semibold" : ""
                            }`
                        }
                    >
                        <BsFillPeopleFill className="text-lg" />
                        <span>Employees</span>
                    </NavLink>

                    <NavLink
                        to="/superadmin/barcode"
                        onClick={() => {
                            setIsSidebarOpen(false);
                        }}
                        className={({ isActive }) =>
                            `flex items-center gap-2 text-sm px-4 py-2 rounded hover:bg-gray-700 ${isActive ? "bg-blue-600 font-semibold" : ""
                            }`
                        }
                    >
                        <HiMiniCpuChip className="text-lg" />
                        <span>Scan barcode</span>
                    </NavLink>
                </nav>

                <div className="mt-auto">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-100 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SuperAdmin;
