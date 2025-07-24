import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystems } from '../context/SystemContext';
import axios from 'axios';
import {
    UilEye,
    UilEdit
} from "@iconscout/react-unicons";
import CreateSystem from './CreateSystem';
import { toast } from 'react-toastify';

const SystemListPage = () => {
    const { systems, setSystems } = useSystems();
    const [selectedSystem, setSelectedSystem] = useState(null);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(null);
    const [errors, setErrors] = useState({});

    const [unassignedEmployees, setUnassignedEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(undefined);

    const [existingParts, setExistingParts] = useState([]);
    const [parts, setParts] = useState([]);
    const [allParts, setAllParts] = useState([]);
    const [selectedPartIds, setSelectedPartIds] = useState([]);

    const handleNameChange = (e) => {
        setErrors({});
        setSelectedSystem((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleOpen = (type, system) => {
        setSelectedSystem(system);
        setOpenModal(type);
    };
    const handleClose = () => {
        setSelectedSystem(null);
        setSelectedPartIds([]);
        setOpenModal(null);
    };

    useEffect(() => {
        if (!selectedSystem) return;
        const fetchAssignedParts = async () => {
            try {
                const res = await axios.get(`https://systrack-backend-deployment.onrender.com/api/system/by-system/${selectedSystem._id}`);
                setExistingParts(res.data.parts);
            } catch (err) {
                console.error("Error fetching parts:", err);
            }
        };

        fetchAssignedParts();
    }, [selectedSystem, existingParts]);

    const handlePartSelect = (e) => {
        setErrors({});
        const value = e.target.value;
        setSelectedPartIds((prevIds) => {
            if (prevIds.includes(value)) return prevIds;
            return [...prevIds, value];
        })
        const remainingParts = parts.filter((part) => value.toString() != part._id?.toString())
        setParts(remainingParts);
    }

    const handleRemovePart = (id) => {
        setSelectedPartIds(prev => prev.filter(partId => partId !== id));
        const removedPart = allParts.find(part => part._id === id);
        if (removedPart) {
            setParts(prev => [...prev, removedPart]);
        }
    }

    const handleEmployeeSelect = (e) => {
        setSelectedEmployeeId(e.target.value);
        setErrors((prev) => ({ ...prev, employee: '' }))
    }

    useEffect(() => {
        fetchSystems();
    }, []);

    useEffect(() => {
        fetchUnassignedEmployees();
        fetchFreeParts();
    }, [systems, selectedSystem])

    const fetchUnassignedEmployees = async () => {
        try {
            const res = await axios.get("https://systrack-backend-deployment.onrender.com/api/employee/unassigned");
            setUnassignedEmployees(res.data.employees);
        } catch (error) {
            console.error("Failed to fetch Unassigned employees:", error);
        }
    }

    const fetchFreeParts = async () => {
        try {
            const res = await axios.get('https://systrack-backend-deployment.onrender.com/api/part/freeparts');
            setAllParts(res.data.parts);
            setParts(res.data.parts);
        } catch (err) {
            setError('Failed to fetch parts');
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystems = async () => {
        try {
            const res = await axios.get('https://systrack-backend-deployment.onrender.com/api/system/allsys');
            setSystems(res.data.systems);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch parts');
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePartFromSystem = async (partId) => {
        try {
            await axios.put(`https://systrack-backend-deployment.onrender.com/api/system/${selectedSystem._id}/remove-part/${partId}`);
            setExistingParts(prev => prev.filter(p => p._id !== partId));
            fetchFreeParts();
            fetchSystems();
            toast.success("Part removed success");
        } catch (err) {
            console.error("Failed to remove part:", err);
            alert("Error removing part. Check console.");
        }
    };

    const handleUnassign = async () => {
        try {
            if (!selectedSystem?._id) return;
            const res = await axios.patch(`https://systrack-backend-deployment.onrender.com/api/system/unassign/${selectedSystem._id}`);
            fetchSystems();
            setSelectedSystem(null);
            toast.success(res.data.message);
        } catch (error) {
            console.error("Error deleting part:", error);
            toast.error("Failed to delete part.");
        }
    }

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) {
            setErrors({ employee: "Please select an employee before assigning." });
            return;
        }
        try {
            const res = await axios.post(`https://systrack-backend-deployment.onrender.com/api/system/assignSystem/${selectedSystem._id}`, {
                EmployeeID: selectedEmployeeId
            });

            toast.success(res.data.message);
            fetchSystems();
            // handleClose();
        } catch (err) {
            console.error("Assignment error:", err);
            toast.error("Failed to assign system.");
        }
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`https://systrack-backend-deployment.onrender.com/api/system/updateSystem/${selectedSystem._id}`, {
                name: selectedSystem.name,
                parts: selectedPartIds
            });
            fetchSystems();
            toast.success(res.data.message);
            handleClose();
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error("Unexpected error:", err);
            }
        }

    };


    if (loading) return <p className="text-gray-500">Loading systems...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    console.log(systems)

    return (
        <div className="w-full px-4 py-4">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Total Systems ({systems.length > 0 ? systems.length : '0'})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-indigo-700"
                    >
                        + Add New System
                    </button>
                    <button
                        onClick={() => navigate('/superadmin')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {showModal && <CreateSystem onClose={() => setShowModal(false)} />}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-left">
                        <tr>
                            <th className="py-2 px-4">System Name</th>
                            <th className="py-2 px-4">Total Parts</th>
                            <th className="py-2 px-4">Assigned To</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="text-gray-700">
                        {(systems.length == 0 && !loading) ? <tr><td colSpan={4} className="text-center py-4 text-gray-500 text-2xl">No system found</td></tr> : systems.map((system) => (
                            <tr key={system._id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{system?.name}</td>
                                <td className="py-2 px-4">{system?.parts?.length ?? 0}</td>
                                <td className="py-2 px-4">{system?.assignedTo?.email ?? "NIL"}</td>
                                <td className="py-2 px-4 capitalize">
                                    <span className={system.status === "assigned" ? "text-green-600" : "text-red-500"}>{system.status}</span>
                                </td>
                                <td className="py-2 px-4 text-center space-x-2">
                                    <button onClick={() => handleOpen("view", system)}>
                                        <UilEye className="text-blue-600 hover:text-blue-800" />
                                    </button>
                                    <button onClick={() => handleOpen("edit", system)}>
                                        <UilEdit className="text-green-600 hover:text-green-800" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {openModal === "view" && selectedSystem && (
                <Modal title={`View System`} onClose={handleClose}>
                    <div className="max-h-[70vh] overflow-y-auto space-y-4 text-gray-700 pr-2">
                        <p><strong>System Name:</strong> {selectedSystem.name}</p>
                        <p><strong>Assigned to:</strong> {selectedSystem?.assignedTo?.email || "N/A"}</p>
                        <p><strong>Status:</strong> <span className={selectedSystem.status === "assigned" ? "text-green-600" : "text-yellow-600"}>{selectedSystem.status}</span></p>

                        {selectedSystem?.parts.length < 1 ? (<p>No parts added</p>) : selectedSystem.parts.map((part) => (
                            <div key={part._id} className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-semibold text-gray-800 mb-2">Part: {part.partType}</h3>
                                <p><strong>Model:</strong> {part.model ?? "N/A"}</p>
                                <p><strong>Brand:</strong> {part.brand ?? "N/A"}</p>
                                <p><strong>Multiple Systems:</strong> {part.isMultiple ? "Yes" : "No"}</p>
                                <p><strong>Status:</strong>
                                    <span className={part.status === "Active" ? "text-green-600" : "text-red-600"}> {part.status ?? "N/A"}</span>
                                </p>
                                <p><strong>Unusable Reason:</strong> {part.unusableReason ?? "N/A"}</p>
                                <p><strong>Barcode:</strong> {part.barcode ?? "N/A"}</p>
                                <p><strong>Serial Number:</strong> {part.serialNumber ?? "N/A"}</p>
                                <p><strong>Notes:</strong> {part.notes || 'N/A'}</p>
                                {part.specs?.length > 0 ? (
                                    <>
                                        <p><strong>Specs:</strong></p>
                                        <ul className="list-disc ml-5">
                                            {part.specs.map((spec, idx) => (
                                                <li key={idx}>{spec.key}: {spec.value}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p><strong>Specs:</strong> N/A</p>
                                )}
                            </div>
                        ))}
                    </div>
                </Modal>
            )}


            {openModal === "edit" && selectedSystem && (
                <Modal title="Edit System Details" onClose={handleClose}>
                    <div className="max-h-[70vh] overflow-y-auto space-y-4 text-gray-700 pr-2">
                        <div>
                            <label className="block mb-1 font-medium">System Name</label>
                            <input
                                type="text"
                                name="name"
                                value={selectedSystem.name}
                                onChange={handleNameChange}
                                className="w-full p-2 border rounded-lg"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                Add Part (by Part Type - Barcode)
                            </label>

                            {parts && parts.length > 0 ? (
                                <select
                                    name="selectedPartId"
                                    className={`w-full p-2 border rounded-lg ${errors.parts ? 'border-red-500' : ''}`}
                                    onChange={handlePartSelect}
                                    value=""
                                >
                                    <option value="">-- Select Part --</option>
                                    {parts.map(part => (
                                        <option key={part._id} value={part._id}>
                                            {part.partType} - {part.barcode}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-gray-500 text-sm italic mt-1">No parts are available to add.</p>
                            )}

                            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                                {selectedPartIds?.map(id => {
                                    const part = allParts.find(p => p._id === id);
                                    return (
                                        <li key={id} className="flex justify-between items-center py-1">
                                            <span>{part?.partType} - {part?.barcode ?? 'Unknown'}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePart(id)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                                title="Remove"
                                            >
                                                ✖
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {errors.parts && (
                                <p className="text-red-500 text-sm">{errors.parts}</p>
                            )}
                        </div>


                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {existingParts.map(part => (
                                <li key={part._id} className="flex justify-between items-center">
                                    <span>{part.partType} - {part.barcode}</span>
                                    <button
                                        onClick={() => handleRemovePartFromSystem(part._id)}
                                        className="ml-2 bg-red-500 round text-white p-2 rounded-lg cursor-pointer text-xs"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>



                        {/* Assign/Unassign Buttons */}
                        <div className="flex flex-col gap-2 space-y-4">
                            {selectedSystem.assignedTo ? (
                                <>
                                    <p><strong>Assigned to:</strong> {selectedSystem.assignedTo.email}</p>
                                    <button
                                        onClick={handleUnassign}
                                        className="px-4 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                                    >
                                        Unassign
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 space-y-1">
                                    <label className="block mb-1 font-medium text-gray-700">
                                        Assign to Employee (by Name - EMP_ID)
                                    </label>

                                    {unassignedEmployees && unassignedEmployees.length > 0 ? (
                                        <select
                                            name="employee"
                                            className={`w-full p-2 border rounded-lg ${errors.employee ? 'border-red-500' : ''}`}
                                            onChange={handleEmployeeSelect}
                                            value={selectedEmployeeId}
                                        >
                                            <option value="">-- Select Employee --</option>
                                            {unassignedEmployees.map(emp => (
                                                <option key={emp._id} value={emp._id}>
                                                    {emp.name} - {emp.employeeID}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm italic text-gray-500">All employees have systems assigned.</p>
                                    )}

                                    {errors.employee && (
                                        <p className="text-sm text-red-600 mt-1">{errors.employee}</p>
                                    )}

                                    <button
                                        onClick={handleAssign}
                                        className="px-1 w-full py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                                        disabled={unassignedEmployees?.length === 0}
                                    >
                                        Assign
                                    </button>
                                </div>


                            )}
                        </div>

                        <button
                            onClick={handleUpdate}
                            className="px-4 w-full mt-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Update System
                        </button>
                    </div>
                </Modal>
            )}


            {/* {openModal === "delete" && selectedSystem && (
                <Modal title="Deallocate Confirmation" onClose={handleClose}>
                    <p>Are you sure you want to deallocate system <strong>{selectedSystem.name}</strong>?</p>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={handleDeallocate}>
                            Deallocate
                        </button>
                    </div>
                </Modal>
            )} */}


        </div>
    );
};

const Modal = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scroll">
                <div className="flex justify-between items-center mb-4 ">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 text-3xl hover:text-black">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default SystemListPage;
