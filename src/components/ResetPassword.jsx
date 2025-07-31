import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function ResetPassword() {
    const { token } = useParams();
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setMessage("Passwords do not match.");
        }

        try {
            await axios.post(`${baseURL}/api/employee/reset-password`, {
                token,
                password,
            });

            alert("Password has been reset.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            setMessage("Reset link is invalid or expired.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Reset Your Password</h2>
            {message && <p className="text-red-500">{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    className="w-full border p-2 my-2 rounded"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    className="w-full border p-2 my-2 rounded"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-2">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;
