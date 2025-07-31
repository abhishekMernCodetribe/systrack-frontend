import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";

const CreateParts = ({ onClose , setPart, page, limit}) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const [loading, setLoading] = useState(false);
    const [specError, setSpecError] = useState('');

    const [formData, setFormData] = useState({
        partType: '',
        brand: '',
        model: '',
        serialNumber: '',
        barcode: '',
        status: 'Active',
        unusableReason: '',
        specs: [],
        notes: ''
    });

    const [specInput, setSpecInput] = useState({ key: '', value: '' });
    const [errors, setErrors] = useState({});


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSpec = () => {
        const { key, value } = specInput;

        if ((key && !value) || (!key && value)) {
            setSpecError("Both Spec Key and Spec Value must be filled.");
            return;
        }

        if (!key && !value) {
            setSpecError("Please fill in both fields before adding.");
            return;
        }
        if (specInput.key && specInput.value) {
            setFormData(prev => ({
                ...prev,
                specs: [...prev.specs, { ...specInput }]
            }));
            setSpecInput({ key: '', value: '' });
            setSpecError('');
        }
    };

    const fetchParts = async () => {
        try {
            const res = await axios.get(`${baseURL}/api/part`, {
                params: {
                    page,
                    limit
                }
            });;
            setPart(res.data.parts);
        } catch (err) {
            console.log(err);
            setErrors('Failed to fetch parts');
        }
    };

    const handleRemoveSpec = (index) => {
        const updatedSpecs = [...formData.specs];
        updatedSpecs.splice(index, 1);
        setFormData((prev) => ({ ...prev, specs: updatedSpecs }));
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            setErrors({});
            const payload = {
                ...formData,
                assignedSystem: []
            };
            const res = await axios.post(`${baseURL}/api/part`, payload);
            fetchParts();
            toast.success(res.data.message);
            onClose();
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error("Error in creating parts", err);
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-6 w-full max-w-lg relative custom-scroll">
                <button
                    onClick={onClose}
                    className="absolute rounded-lg top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4">Add New Part</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Part Type */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Part Type</label>
                        <select
                            name="partType"
                            onChange={handleChange}
                            value={formData.partType}
                            className={`w-full p-2 border rounded-lg ${errors.partType ? 'border-red-500' : ''}`}
                            required
                        >
                            <option value="">Select Part Type</option>
                            <option value="RAM">RAM</option>
                            <option value="CPU">CPU</option>
                            <option value="HDD">HDD</option>
                            <option value="SSD">SSD</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Printer">Printer</option>
                            <option value="Headphone">Headphone</option>
                        </select>
                        {errors.partType && <p className="text-red-500 text-sm">{errors.partType}</p>}
                    </div>

                    {/* Brand & Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Brand</label>
                            <input
                                name="brand"
                                onChange={handleChange}
                                value={formData.brand}
                                className={`w-full p-2 border rounded-lg ${errors.brand ? 'border-red-500' : ''}`}
                                placeholder="Brand"
                                required
                            />
                            {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Model</label>
                            <input
                                name="model"
                                onChange={handleChange}
                                value={formData.model}
                                className={`w-full p-2 border rounded-lg ${errors.model ? 'border-red-500' : ''}`}
                                placeholder="Model"
                                required
                            />
                            {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                        </div>
                    </div>

                    {/* Serial Number & Barcode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Serial Number</label>
                            <input
                                name="serialNumber"
                                onChange={handleChange}
                                value={formData.serialNumber}
                                className={`w-full p-2 border rounded-lg ${errors.serialNumber ? 'border-red-500' : ''}`}
                                placeholder="Serial Number"
                                required
                            />
                            {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber}</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Barcode</label>
                            <input
                                name="barcode"
                                onChange={handleChange}
                                value={formData.barcode}
                                className={`w-full p-2 border rounded-lg ${errors.barcode ? 'border-red-500' : ''}`}
                                placeholder="Barcode"
                                required
                            />
                            {errors.barcode && <p className="text-red-500 text-sm">{errors.barcode}</p>}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            onChange={handleChange}
                            value={formData.status}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="Active">Active</option>
                            <option value="Unusable">Unusable</option>
                        </select>
                    </div>

                    {/* Unusable Reason */}
                    {formData.status === "Unusable" && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Reason for Unusable</label>
                            <input
                                name="unusableReason"
                                onChange={handleChange}
                                value={formData.unusableReason}
                                className={`w-full p-2 border rounded-lg ${errors.unusableReason ? 'border-red-500' : ''}`}
                                placeholder="Reason for unusable status"
                            />
                            {errors.unusableReason && <p className="text-red-500 text-sm">{errors.unusableReason}</p>}
                        </div>
                    )}

                    {/* Specs */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Specs (Key / Value)</label>
                        <div className="flex flex-col md:flex-row gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Spec Key"
                                className="flex-1 p-2 border rounded-lg"
                                value={specInput.key}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(value) || value === '') {
                                        setSpecInput((prev) => ({ ...prev, key: value }));
                                    }
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Spec Value"
                                className="flex-1 p-2 border rounded-lg"
                                value={specInput.value}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(value) || value === '') {
                                        setSpecInput((prev) => ({ ...prev, value }));
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addSpec}
                                className="bg-green-600 text-white px-3 py-2 rounded-lg"
                            >
                                + Add
                            </button>
                        </div>
                        {specError && <p className="text-red-500 text-sm">{specError}</p>}
                        {formData.specs.length > 0 && (
                            <ul className="text-sm text-gray-700 space-y-1">
                                {formData.specs.map((spec, idx) => (
                                    <li key={idx} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                                        <span>{spec.key}: {spec.value}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSpec(idx)}
                                            className="text-red-500 hover:text-red-700 font-bold ml-3"
                                        >
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Notes</label>
                        <input
                            name="notes"
                            onChange={handleChange}
                            value={formData.notes}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Notes"
                        />
                        {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Add Part
                    </button>
                </form>

            </div>
        </div>
    );
};

export default CreateParts;