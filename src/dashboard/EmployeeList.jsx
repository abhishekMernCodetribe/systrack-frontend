import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from "axios";
import { toast } from "react-toastify";
import CreateEmployee from './CreateEmployee';
import {
    UilEye,
    UilEdit,
    UilTrashAlt,
} from "@iconscout/react-unicons";
import isEqual from "lodash.isequal";

const EmployeeList = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const [employee, setEmployee] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(2);
    const [totalPages, setTotalPages] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [totalEmployee, setTotalEmployee] = useState(0);

    useEffect(() => {
        fetchEmployees();
    }, [page, limit]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchEmployees();
        }, 500);

        return () => clearTimeout(delay);
    }, [searchText]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/system/stats`);
            setTotalEmployee(res.data.totalEmployees)
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [])

    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [errors, setErrors] = useState({});

    const [editForm, setEditForm] = useState({
        name: '',
        employeeID: '',
        department: '',
        designation: '',
        email: '',
        phone: ''
    });

    const [originalData, setOriginalData] = useState({
        name: '',
        employeeID: '',
        department: '',
        designation: '',
        email: '',
        phone: ''
    })

    useEffect(() => {
        if (selectedEmployee && openModal === "edit") {
            setEditForm({
                name: selectedEmployee.name || '',
                employeeID: selectedEmployee.employeeID || '',
                department: selectedEmployee.department || '',
                designation: selectedEmployee.designation || '',
                email: selectedEmployee.email || '',
                phone: selectedEmployee.phone || ''
            });
            setOriginalData({
                name: selectedEmployee.name || '',
                employeeID: selectedEmployee.employeeID || '',
                department: selectedEmployee.department || '',
                designation: selectedEmployee.designation || '',
                email: selectedEmployee.email || '',
                phone: selectedEmployee.phone || ''
            });

        }
    }, [selectedEmployee, openModal]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const getUpdatedFields = (originalData, editForm) => {
        const updates = {};

        for (const key in editForm) {
            const newValue = editForm[key];
            const oldValue = originalData[key];
            if (
                newValue !== undefined &&
                newValue !== null &&
                newValue !== "" &&
                newValue !== oldValue
            ) {
                updates[key] = newValue;
            }
        }

        return updates;
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            if (isEqual(originalData, editForm)) {
                handleClose();
                return;
            }
            const updatedEmployee = getUpdatedFields(originalData, editForm);
            const res = await axios.put(`${baseURL}/api/employee/${selectedEmployee._id}`, updatedEmployee);
            toast.success(res.data.message);
            fetchEmployees();
            setErrors({});
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


    const handleOpen = (type, emp) => {
        setSelectedEmployee(emp);
        setOpenModal(type);
    };
    const handleClose = () => {
        setSelectedEmployee(null);
        setErrors({})
        setOpenModal(null);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseURL}/api/employee/allemployee`, {
                params: {
                    search: searchText,
                    page,
                    limit
                }
            });

            setEmployee(res.data.employees);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            setEmployee([]);
            console.error(err);
            setError('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            if (!selectedEmployee._id) return;
            const res = await axios.delete(`${baseURL}/api/employee/${selectedEmployee._id}`);
            fetchEmployees();
            setSelectedEmployee(null);
            setOpenModal(null);
            toast.success(res.data.message);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete employee");
        }
    };

    // if (loading) return <p className="text-gray-500">Loading employees...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full px-4 py-4">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Total Employees ({totalEmployee})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-indigo-700"
                    >
                        + Add New Employee
                    </button>
                    <button
                        onClick={() => navigate('/superadmin')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {showModal && <CreateEmployee onClose={() => setShowModal(false)} />}

            <div className="overflow-x-auto border rounded-lg shadow">
                <div className="flex flex-wrap m-2 items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search by email"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                        className="border rounded px-3 py-2 text-sm w-64"
                    />
                </div>
                <div className="overflow-x-auto flex flex-col justify-between h-[70vh]">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100 text-gray-600 text-left">
                            <tr>
                                <th className="py-2 px-4">Name</th>
                                <th className="py-2 px-4">Email</th>
                                <th className="py-2 px-4">Phone</th>
                                <th className="py-2 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {(!loading && employee?.length === 0) ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500 text-2xl">
                                        No Employees found
                                    </td>
                                </tr>
                            ) : (
                                employee.map((emp) => (
                                    <tr key={emp._id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4">{emp.name}</td>
                                        <td className="py-2 px-4">{emp.email}</td>
                                        <td className="py-2 px-4">{emp.phone}</td>
                                        <td className="py-2 px-4 text-center space-x-2">
                                            <button onClick={() => handleOpen("view", emp)}>
                                                <UilEye className="text-blue-600 hover:text-blue-800" />
                                            </button>
                                            <button onClick={() => handleOpen("edit", emp)}>
                                                <UilEdit className="text-green-600 hover:text-green-800" />
                                            </button>
                                            <button onClick={() => handleOpen("delete", emp)}>
                                                <UilTrashAlt className="text-red-600 hover:text-red-800" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-center  my-4 space-x-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="ml-4 px-2 py-1 border rounded text-sm"
                        >
                            {[2, 4, 6, 8, 10].map((num) => (
                                <option key={num} value={num}>
                                    {num} / page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {openModal === "view" && selectedEmployee && (
                <Modal title="View Employee Details" onClose={handleClose}>
                    <div className="max-h-[70vh] overflow-y-auto space-y-3 text-gray-700 pr-2">
                        {/* Employee Info */}
                        <p><strong>Name:</strong> {selectedEmployee.name ?? "N/A"}</p>
                        <p><strong>Employee ID:</strong> {selectedEmployee.employeeID ?? "N/A"}</p>
                        <p><strong>Email:</strong> {selectedEmployee.email ?? "N/A"}</p>
                        <p><strong>Phone:</strong> {selectedEmployee.phone ?? "N/A"}</p>
                        <p><strong>Department:</strong> {selectedEmployee.department ?? "N/A"}</p>
                        <p><strong>Designation:</strong> {selectedEmployee.designation ?? "N/A"}</p>

                        {/* Allocated System */}
                        {selectedEmployee.allocatedSys ? (
                            <div className="mt-4 border-t pt-2">
                                <h3 className="font-semibold text-lg text-gray-800">Allocated System</h3>
                                <p><strong>System Name:</strong> {selectedEmployee.allocatedSys.name ?? "N/A"}</p>
                                <p><strong>Status:</strong> <span className={selectedEmployee.allocatedSys.status === "unassigned" ? "text-red-600" : "text-green-600"}>{selectedEmployee.allocatedSys.status}</span></p>

                                {/* Parts List */}
                                {selectedEmployee.allocatedSys.parts && selectedEmployee.allocatedSys.parts.length > 0 ? (
                                    <div className="mt-2">
                                        <p className="font-medium">Parts:</p>
                                        <ul className="list-disc ml-5 space-y-1">
                                            {selectedEmployee.allocatedSys.parts.map(part => (
                                                <li key={part._id}>
                                                    <p><strong>Type:</strong> {part.partType}</p>
                                                    <p><strong>Brand:</strong> {part.brand}</p>
                                                    <p><strong>Model:</strong> {part.model}</p>
                                                    <p><strong>Status:</strong> <span className={part.status === "Active" ? "text-green-600" : "text-red-600"}>{part.status}</span></p>
                                                    <p><strong>Serial No:</strong> {part.serialNumber}</p>
                                                    <p><strong>Barcode:</strong> {part.barcode}</p>
                                                    <img src={`${baseURL}/${part.barcodeImage}`} className='w-[90%]' alt="barcode" />
                                                    <hr className="my-2 border-gray-300" />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p>No parts assigned to this system.</p>
                                )}
                            </div>
                        ) : (
                            <p className="mt-4 text-red-500">No system allocated.</p>
                        )}
                    </div>
                </Modal>
            )}


            {openModal === "edit" && selectedEmployee && (
                <Modal title="Edit Employee Details" onClose={handleClose}>
                    <div className="space-y-4">
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                <input
                                    type="text"
                                    name="employeeID"
                                    className={`w-full p-2 border rounded-lg ${errors.employeeID ? 'border-red-500' : ''}`}
                                    value={editForm.employeeID}
                                    onChange={handleEditChange}
                                    required
                                />
                                {errors.employeeID && <p className="text-red-500 text-sm">{errors.employeeID}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    className={`w-full p-2 border rounded-lg bg-gray-200 ${errors.department ? 'border-red-500' : ''}`}
                                    value={editForm.department}
                                    required
                                    disabled
                                />
                                {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    className={`w-full p-2 border rounded-lg ${errors.designation ? 'border-red-500' : ''}`}
                                    value={editForm.designation}
                                    onChange={handleEditChange}
                                    required
                                />
                                {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    required
                                />
                                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {openModal === "delete" && selectedEmployee && (
                <Modal title="Delete Confirmation" onClose={handleClose}>
                    <p>Are you sure you want to delete <strong>{selectedEmployee.name}</strong>?</p>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </Modal>
            )}
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

export default EmployeeList;
