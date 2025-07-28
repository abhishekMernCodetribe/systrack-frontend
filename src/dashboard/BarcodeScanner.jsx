import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import axios from "axios";

const BarcodeScanner = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const videoRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [barcode, setBarcode] = useState(null);
    const [part, setPart] = useState(null);
    const [loading, setLoading] = useState(false);
    const codeReader = useRef(null);

    const startScanner = async () => {
        setScanning(true);
        codeReader.current = new BrowserMultiFormatReader();

        try {
            await codeReader.current.decodeFromConstraints(
                {
                    video: {
                        facingMode: { exact: "environment" } // back camera
                    },
                    audio: false
                },
                videoRef.current,
                (result, error) => {
                    if (result) {
                        const scannedValue = result.getText();
                        setBarcode(scannedValue);
                        fetchPartDetails(scannedValue);
                        stopScanner(); // or delay this if you want user to confirm
                    }
                }
            );
        } catch (err) {
            console.error("Error accessing camera:", err);
            setScanning(false);
        }
    };

    const stopScanner = () => {
        codeReader.current?.reset();
        setScanning(false);
    };

    const fetchPartDetails = async (barcodeImageName) => {
        setLoading(true);
        try {
            const imageName = barcodeImageName.replace(/^.*[\\/]/, '');
            const res = await axios.get(`${baseURL}/api/part/barcode/${imageName}`);
            setPart(res.data);
        } catch (err) {
            console.error("Failed to fetch part:", err);
            setPart(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => stopScanner();
    }, []);

    return (
        <div className="text-center space-y-4 p-4">
            {!scanning ? (
                <button
                    onClick={startScanner}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
                >
                    Scan Now
                </button>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg shadow bg-black"
                        autoPlay
                        muted
                        playsInline
                    />
                    <button
                        onClick={stopScanner}
                        className="bg-red-500 text-white px-4 py-2 rounded-md shadow mt-2"
                    >
                        Stop Scanning
                    </button>
                </>
            )}

            {barcode && (
                <div className="mt-4">
                    ✅ <span className="text-green-600 font-semibold">Scanned Barcode:</span> {barcode}
                </div>
            )}

            {loading && <p className="text-gray-500">Fetching part details...</p>}

            {part && (
                <div className="text-left max-w-xl mx-auto mt-4 border rounded-lg p-4 shadow space-y-2">
                    <h2 className="text-lg font-semibold text-blue-700">🔍 Part Information</h2>
                    <p><strong>Type:</strong> {part.partType}</p>
                    <p><strong>Model:</strong> {part.model}</p>
                    <p><strong>Brand:</strong> {part.brand}</p>
                    <p><strong>Serial Number:</strong> {part.serialNumber}</p>
                    <p><strong>Status:</strong> <span className={part.status === "Active" ? "text-green-600" : "text-red-600"}>{part.status}</span></p>
                    <p><strong>Notes:</strong> {part.notes || "N/A"}</p>
                    <p><strong>Barcode:</strong> {part.barcode}</p>
                    <img
                        src={`${baseURL}/${part.barcodeImage}`}
                        alt="Barcode"
                        className="w-[200px] mt-2"
                    />
                    <p><strong>Specs:</strong></p>
                    <ul className="list-disc ml-5">
                        {part.specs?.map((spec) => (
                            <li key={spec._id}>{spec.key}: {spec.value}</li>
                        ))}
                    </ul>
                </div>
            )}

            {barcode && !part && !loading && (
                <div className="text-red-500">No part found for this barcode.</div>
            )}
        </div>
    );
};

export default BarcodeScanner;
