import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParts } from '../context/PartsContext';
import CreateParts from './CreateParts';
import axios from 'axios';
import {
    UilEye,
    UilEdit,
    UilTrashAlt,
} from "@iconscout/react-unicons";
import { toast } from 'react-toastify';

const PartsList = () => {
    const { parts, setParts } = useParts();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [errors, setErrors] = useState({});

    const partTypeRef = useRef();
    const barcodeRef = useRef();
    const serialRef = useRef();
    const brandRef = useRef();
    const modelRef = useRef();

    useEffect(() => {
        if (errors.partType) {
            partTypeRef.current?.focus();
        } else if (errors.barcode) {
            barcodeRef.current?.focus();
        } else if (errors.serialNumber) {
            serialRef.current?.focus();
        } else if (errors.brand) {
            brandRef.current?.focus();
        } else if (errors.model) {
            modelRef.current?.focus();
        }
    }, [errors]);

    const handleOpen = (type, part) => {
        setSelectedPart(part);
        setOpenModal(type);
    };
    const handleClose = () => {
        setSelectedPart(null);
        setOpenModal(null);
    };

    const handleDeletePart = async () => {
        try {
            if (!selectedPart?._id) return;

            const res = await axios.delete(`http://localhost:5000/api/part/${selectedPart._id}`);
            fetchParts();
            setSelectedPart(null);
            setOpenModal(null);
            toast.success(res.data.message);
        } catch (error) {
            console.error("Error deleting part:", error);
            toast.error("Failed to delete part.");
        }
    }

    const handleUpdatePart = async () => {
        try {
            setErrors({});
            const res = await axios.put(
                `http://localhost:5000/api/part/${selectedPart._id}`,
                selectedPart
            );
            handleClose();
            toast.success(res.data.message);
            fetchParts(); // reload updated data
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error("Unexpected error:", err);
            }
            console.error(err);
        }
    };

    const fetchParts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/part');
            setParts(res.data.parts);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch parts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    if (loading) return <p className="text-gray-500">Loading parts...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full px-4 py-4">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Total Parts ({parts?.length > 0 ? parts.length : '0'})
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-indigo-700"
                    >
                        + Add New Part
                    </button>
                    <button
                        onClick={() => navigate('/superadmin')}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {showModal && <CreateParts onClose={() => setShowModal(false)} />}

            <div className="overflow-x-auto border rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-left">
                        <tr>
                            <th className="py-2 px-4">Part Name</th>
                            <th className="py-2 px-4">Model</th>
                            <th className="py-2 px-4">Brand</th>
                            <th className="py-2 px-4">Status</th>
                            <th className="py-2 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {(parts.length == 0 && !loading) ? <tr><td colSpan={5} className="text-center py-4 text-gray-500 text-2xl">No parts found</td></tr> : parts?.map((part) => (
                            <tr key={part._id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{part.partType}</td>
                                <td className="py-2 px-4">{part.model}</td>
                                <td className="py-2 px-4">{part.brand}</td>
                                <td className="py-2 px-4">
                                    <span className={part.status === "Active" ? "text-green-600" : "text-red-500"}>{part.status}</span>
                                </td>
                                <td className="py-2 px-4 text-center space-x-2">
                                    <button onClick={() => handleOpen("view", part)}>
                                        <UilEye className="text-blue-600 hover:text-blue-800" />
                                    </button>
                                    <button onClick={() => handleOpen("edit", part)}>
                                        <UilEdit className="text-green-600 hover:text-green-800" />
                                    </button>
                                    <button onClick={() => handleOpen("delete", part)}>
                                        <UilTrashAlt className="text-red-600 hover:text-red-800" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {openModal === "view" && selectedPart && (
                <Modal title="View Part Details" onClose={handleClose}>
                    <div className="max-h-[70vh] overflow-y-auto space-y-2 text-gray-700 pr-2">
                        <p><strong>Type:</strong> {selectedPart.partType ?? "N/A"}</p>
                        <p><strong>Model:</strong> {selectedPart.model ?? "N/A"}</p>
                        <p><strong>Brand:</strong> {selectedPart.brand ?? "N/A"}</p>
                        <p><strong>Multiple Systems:</strong> {selectedPart.isMultiple ? "Yes" : "No"}</p>
                        <p><strong>Status:</strong> <span className={selectedPart.status === "Active" ? "text-green-600" : "text-red-600"}>{selectedPart.status ?? "N/A"}</span></p>
                        <p><strong>Unusable Reason:</strong> {selectedPart.unusableReason ?? "N/A"}</p>
                        <p><strong>Barcode:</strong> {selectedPart.barcode ?? "N/A"}</p>
                        <p><strong>Serial Number:</strong> {selectedPart.serialNumber}</p>
                        <p><strong>Notes:</strong> {selectedPart.notes || 'N/A'}</p>
                        <p><strong>Specs:</strong></p>
                        <ul className="list-disc ml-5">
                            {selectedPart?.specs?.map((spec) => (
                                <li key={spec._id}>{spec.key}: {spec.value}</li>
                            ))}
                        </ul>
                    </div>
                </Modal>
            )}

            {openModal === "edit" && selectedPart && (
                <Modal title="Edit Part Details" onClose={handleClose}>
                    <div className="space-y-4">
                        {/* Part Type */}
                        <div>
                            <label className="block font-semibold mb-1">Part Type</label>
                            <input
                                ref={partTypeRef}
                                type="text"
                                className={`w-full p-2 border rounded-lg ${errors.partType ? 'border-red-500' : ''}`}
                                placeholder="Part Type"
                                value={selectedPart.partType}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, partType: e.target.value })
                                }
                            />
                            {errors.partType && <p className="text-red-500 text-sm">{errors.partType}</p>}
                        </div>



                        {/* Barcode */}
                        <div>
                            <label className="block font-semibold mb-1">Barcode</label>
                            <input
                                ref={barcodeRef}
                                type="text"
                                className={`w-full p-2 border rounded-lg ${errors.barcode ? 'border-red-500' : ''}`}
                                placeholder="Barcode"
                                value={selectedPart.barcode}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, barcode: e.target.value })
                                }
                            />
                            {errors.barcode && <p className="text-red-500 text-sm">{errors.barcode}</p>}
                        </div>

                        {/* Serial Number */}
                        <div>
                            <label className="block font-semibold mb-1">Serial Number</label>
                            <input
                                ref={serialRef}
                                type="text"
                                className={`w-full p-2 border rounded-lg ${errors.serialNumber ? 'border-red-500' : ''}`}
                                placeholder="Serial Number"
                                value={selectedPart.serialNumber}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, serialNumber: e.target.value })
                                }
                            />
                            {errors.serialNumber && <p className="text-red-500 text-sm">{errors.serialNumber}</p>}
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block font-semibold mb-1">Brand</label>
                            <input
                                ref={brandRef}
                                type="text"
                                className={`w-full p-2 border rounded-lg ${errors.brand ? 'border-red-500' : ''}`}
                                placeholder="Brand"
                                value={selectedPart.brand}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, brand: e.target.value })
                                }
                            />
                            {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                        </div>

                        {/* Model */}
                        <div>
                            <label className="block font-semibold mb-1">Model</label>
                            <input
                                ref={modelRef}
                                type="text"
                                className={`w-full p-2 border rounded-lg ${errors.model ? 'border-red-500' : ''}`}
                                placeholder="Model"
                                value={selectedPart.model}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, model: e.target.value })
                                }
                            />
                            {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                        </div>

                        {/* Specs */}
                        <div className="space-y-2">
                            <label className="block font-semibold">Specifications</label>
                            {selectedPart?.specs?.map((spec, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        className="flex-1 p-2 border rounded"
                                        value={spec.key}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(value) || value === '') {
                                                const updatedSpecs = [...selectedPart.specs];
                                                updatedSpecs[index].key = value;
                                                setSelectedPart({ ...selectedPart, specs: updatedSpecs });
                                            }
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        className="flex-1 p-2 border rounded"
                                        value={spec.value}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(value) || value === '') {
                                                const updatedSpecs = [...selectedPart.specs];
                                                updatedSpecs[index].value = value;
                                                setSelectedPart({ ...selectedPart, specs: updatedSpecs });
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="text-red-600 text-xl px-2"
                                        onClick={() => {
                                            const updatedSpecs = selectedPart.specs.filter((_, i) => i !== index);
                                            setSelectedPart({ ...selectedPart, specs: updatedSpecs });
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}

                            <button
                                type='button'
                                className='mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
                                onClick={() => {
                                    const updatedSpecs = [...(selectedPart.specs || []), { key: '', value: '' }];
                                    setSelectedPart({ ...selectedPart, specs: updatedSpecs })
                                }}
                            >
                                + Add Spec
                            </button>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block font-semibold mb-1">Notes</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                placeholder="Notes"
                                value={selectedPart.notes || ""}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, notes: e.target.value })
                                }
                            />
                            {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block font-semibold mb-1">Status</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedPart.status}
                                onChange={(e) =>
                                    setSelectedPart({ ...selectedPart, status: e.target.value })
                                }
                            >
                                <option value="Active">Active</option>
                                <option value="Unusable">Unusable</option>
                            </select>
                        </div>

                        {/* Unusable Reason */}
                        {selectedPart.status === "Unusable" && (
                            <div>
                                <label className="block font-semibold mb-1">Unusable Reason</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="Unusable Reason"
                                    value={selectedPart.unusableReason || ""}
                                    onChange={(e) =>
                                        setSelectedPart({
                                            ...selectedPart,
                                            unusableReason: e.target.value,
                                        })
                                    }
                                />
                                {errors.unusableReason && (
                                    <p className="text-red-500 text-sm">{errors.unusableReason}</p>
                                )}
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={handleUpdatePart}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                </Modal>
            )}

            {openModal === "delete" && selectedPart && (
                <Modal title="Delete Confirmation" onClose={handleClose}>
                    <p>Are you sure you want to delete <strong>{selectedPart.partType}</strong>?</p>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={handleDeletePart}>
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

export default PartsList;
