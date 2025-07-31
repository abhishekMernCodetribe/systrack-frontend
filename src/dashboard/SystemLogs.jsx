import React, { useEffect, useState } from "react";
import axios from "axios";

const SystemLogs = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/system/logs`, {
                withCredentials: true,
            });
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    if (loading) return <p className="text-center py-4">Loading logs...</p>;
    if (logs.length === 0) return <p className="text-center py-4">No logs found.</p>;

    return (
        <div className="overflow-x-auto text-sm rounded-lg shadow border">
            <table className="min-w-full table-auto">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="px-4 py-2 text-left">Time</th>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">System</th>
                        <th className="px-4 py-2 text-left">Performed By</th>
                        <th className="px-4 py-2 text-left">User Email</th>
                        <th className="px-4 py-2 text-left">Assigned / Unassigned</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {logs.map((log) => {
                        const {
                            _id,
                            actionType,
                            timestamp,
                            entityId,
                            performedBy,
                            details,
                        } = log;

                        const isAssign = actionType === "ASSIGN_SYSTEM";
                        const time = new Date(timestamp).toLocaleString();
                        const systemName = entityId?.name || "N/A";
                        const actorName = performedBy?.name || "Unknown";
                        const actorEmail = performedBy?.email || "N/A";
                        const person = isAssign
                            ? details?.assignedTo || "—"
                            : details?.UnassignedFrom || "—";
                        const targetEmail = details?.employee_email || "—";

                        return (
                            <tr key={_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">{time}</td>
                                <td className="px-4 py-2 font-medium text-blue-600 capitalize">
                                    {actionType.replace("_", " ")}
                                </td>
                                <td className="px-4 py-2">{systemName}</td>
                                <td className="px-4 py-2">{actorName}</td>
                                <td className="px-4 py-2">{actorEmail}</td>
                                <td className="px-4 py-2">
                                    <div>
                                        <span className={isAssign ? "text-green-600" : "text-red-600"}>
                                            {person}
                                        </span>
                                        <br />
                                        <span className="text-gray-500 text-xs">{targetEmail}</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SystemLogs;
