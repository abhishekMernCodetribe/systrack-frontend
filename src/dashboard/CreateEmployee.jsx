import React, { useEffect, useState } from 'react'
import { useEmployees } from '../context/EmployeeContext';
import { X } from "lucide-react";
import axios from "axios";
import { toast } from 'react-toastify';

const CreateEmployee = ({ onClose }) => {
    const { setEmployees } = useEmployees();
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        employeeID: '',
        department: '',
        designation: '',
        email: '',
        phone: ''
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;    
        }

        if (name === 'department') {
            const allowed = ['HR', 'Manager', 'Employee'];
            if (!allowed.includes(value)) return;
        }
        setNewEmployee((prev) => ({
            ...prev,
            [name]: value
        }));
        
    };

    useEffect(()=>{
        console.log(newEmployee);
    }, [newEmployee])



    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            setErrors({});
            const res = await axios.post('http://localhost:5000/api/employee', newEmployee);
            if (res.status === 201) {
                setEmployees((prev) => [...prev, res.data]);
                toast.success(res.data.message || "Employee created successfully");
                setNewEmployee({
                    name: '',
                    employeeID: '',
                    department: '',
                    designation: '',
                    email: '',
                    phone: ''
                });
                setErrors({});
                onClose();
            }
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error("Error in create employee", err);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 w-full max-w-lg relative custom-scroll">
                <button
                    onClick={onClose}
                    className="absolute rounded-lg top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>

                <form onSubmit={handleCreateEmployee} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <label className="block font-medium text-gray-700">Name</label>
                            <input
                                name="name"
                                onChange={handleInputChange}
                                value={newEmployee.name}
                                className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Enter employee name"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Employee ID</label>
                            <input
                                name="employeeID"
                                onChange={handleInputChange}
                                value={newEmployee.employeeID}
                                className={`w-full p-2 border rounded-lg ${errors.employeeID ? 'border-red-500' : ''}`}
                                placeholder="Enter employee ID"
                                required
                            />
                            {errors.employeeID && <p className="text-red-500 text-sm">{errors.employeeID}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Department</label>
                            <select
                                name="department"
                                onChange={handleInputChange}
                                value={newEmployee.department}
                                className={`w-full p-2 border rounded-lg ${errors.department ? 'border-red-500' : ''}`}
                                required
                            >
                                <option value="">-- Select Department --</option>
                                <option value="HR">HR</option>
                                <option value="Manager">Manager</option>
                                <option value="Employee">Employee</option>
                            </select>
                            {errors.department && (
                                <p className="text-red-500 text-sm">{errors.department}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Designation</label>
                            <input
                                name="designation"
                                onChange={handleInputChange}
                                value={newEmployee.designation}
                                className={`w-full p-2 border rounded-lg ${errors.designation ? 'border-red-500' : ''}`}
                                placeholder="Enter designation"
                                required
                            />
                            {errors.designation && <p className="text-red-500 text-sm">{errors.designation}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Email</label>
                            <input
                                name="email"
                                type='email'
                                onChange={handleInputChange}
                                value={newEmployee.email}
                                className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="Enter employee ID"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Phone</label>
                            <input
                                name="phone"
                                onChange={handleInputChange}
                                value={newEmployee.phone}
                                className={`w-full p-2 border rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                                placeholder="Enter employee ID"
                                required
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Add Employee
                    </button>
                </form>

            </div>
        </div>
    )
}

export default CreateEmployee