import React, { useRef } from "react";

const BackCamera = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" } }, // Back camera
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            streamRef.current = stream;
        } catch (error) {
            console.error("Failed to access camera:", error);
            alert("Unable to access the back camera. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    return (
        <div className="p-4 text-center">
            <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
            >
                Open Back Camera
            </button>

            <div className="mt-4">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg bg-black"
                />
            </div>

            <button
                onClick={stopCamera}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md shadow"
            >
                Stop Camera
            </button>
        </div>
    );
};

export default BackCamera;
