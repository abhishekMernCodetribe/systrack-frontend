import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useSystems } from '../context/SystemContext';
import { HashLoader } from 'react-spinners';

const CreateSystem = ({ onClose }) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const { setSystems } = useSystems();

    const [allParts, setAllParts] = useState([]);

    const [name, setName] = useState('');
    const [selectedPartIds, setSelectedPartIds] = useState([]);

    const [unassignedEmployees, setUnassignedEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    const fetchUnassignedEmployees = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/employee/unassigned`);
            setUnassignedEmployees(res.data.employees);
        } catch (error) {
            console.error("Failed to fetch Unassigned employees:", error);
        }
    }

    const fetchSystems = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/system/allsys`);
            setSystems(res.data.systems);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch parts');
        } finally {
            setLoading(false);
        }
    };

    const fetchFreeParts = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/part/freeparts`);
            setAllParts(res.data.parts);
            setParts(res.data.parts);
        } catch (err) {
            setError('Failed to fetch parts');
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFreeParts();
        fetchUnassignedEmployees();
    }, []);

    const handleEmployeeSelect = (e) => {
        setSelectedEmployeeId(e.target.value);
        setErrors((prev) => ({ ...prev, employee: '' }))
    }

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

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

    const token = localStorage.getItem('token');
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        if (!name || !selectedPartIds) {
            toast.error("Please enter the required details");
            return;
        };

        try {
            const res = await axios.post(`${baseURL}/api/system/`, {
                name,
                parts: selectedPartIds,
                EmployeeID: selectedEmployeeId
            },
            {
                withCredentials: true
            }
            );
            fetchSystems();
            toast.success(res.data.message);
            onClose();
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error("Unexpected error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <HashLoader color="#62ad61" />
            </div>
        );
    }
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute rounded-lg top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    <X size={24} />
                </button>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* System Name */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">System Name</label>
                        <input
                            name="name"
                            onChange={handleNameChange}
                            value={name}
                            className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Enter system name"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    {/* Part Select by Barcode */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            Select Part (by Part Type - Barcode)
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

                        <ul className='mt-2 text-sm text-gray-600 list-disc list-inside'>
                            {selectedPartIds?.map(id => {
                                const part = allParts.find(p => p._id === id);
                                return (
                                    <li key={id} className='flex justify-between items-center py-1'>
                                        <span>{part?.partType} - {part?.barcode ?? 'Unknown'}</span>
                                        <button
                                            type='button'
                                            onClick={() => handleRemovePart(id)}
                                            className='ml-2 text-red-500 hover:text-red-700'
                                            title='Remove'
                                        >
                                            ✖
                                        </button>
                                    </li>
                                )
                            })
                            }
                        </ul>
                        {errors.parts && (
                            <p className="text-red-500 text-sm">{errors.parts}</p>
                        )}
                    </div>

                    {/* Assign to Employee */}
                    <div>
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
                            <p className="text-red-500 text-sm mt-1">{errors.employee}</p>
                        )}
                    </div>


                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Add System
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSystem;
