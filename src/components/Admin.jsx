import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Admin = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    const [componentLoading, setComponentLoading] = useState(true);
    const {token, role, loading} = useAuth();

    useEffect(() => {
        if(loading) return;

        if (!token) return navigate("/login");

        const verifyAdmin = async () => {
            try {
                const res = await axios.get(
                    `${baseURL}/api/users/admin`,
                    {
                        headers:{
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );

                if (res.status === 200 && res.data.role === "admin") {
                    setAuthorized(true);
                }else {
                    navigate("/unauthorized");
                }
            } catch (err) {
                if ([401, 403].includes(err.response?.status)) {
                    localStorage.clear();
                    navigate("/login");
                } else {
                    console.error(err);
                }
            } finally{
                setComponentLoading(false);
            }
        };

        verifyAdmin();
    }, [token, role, loading, navigate]);

    if (loading || componentLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-xl font-medium text-gray-600 animate-pulse">
                    Verifying access...
                </h1>
            </div>
        );
    }

    if (!authorized)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <h1 className="text-2xl font-semibold text-red-500">
                    Unauthorized access
                </h1>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Admin Logged In
                </h2>
            </div>
        </div>
    );
};

export default Admin;
