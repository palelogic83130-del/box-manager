import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from './ui';
import { X } from 'lucide-react';

const Scanner = ({ onScan, onClose }) => {
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        const startScanner = async () => {
            html5QrCodeRef.current = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            try {
                await html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        handleScan(decodedText);
                    },
                    (error) => { }
                );
            } catch (err) {
                console.error("Camera start failed:", err);
            }
        };

        startScanner();

        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().then(() => {
                    html5QrCodeRef.current.clear();
                }).catch(err => {
                    console.error("Unable to stop/clear scanner", err);
                });
            }
        };
    }, []);

    const handleScan = (decodedText) => {
        try {
            // Handle both full URLs and raw IDs
            const id = decodedText.includes('?id=')
                ? new URL(decodedText).searchParams.get('id')
                : decodedText;

            if (id && !isNaN(id)) {
                onScan(id);
                stopScanner();
            }
        } catch (e) {
            if (!isNaN(decodedText)) {
                onScan(decodedText);
                stopScanner();
            }
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                onClose();
            } catch (err) {
                console.error("Stop failed", err);
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="scanner-overlay">
            <div className="scanner-container">
                <div id="reader"></div>
                <div className="scanner-ui">
                    <button className="close-scanner-btn" onClick={stopScanner}>
                        <X size={32} />
                    </button>
                    <div className="scanner-guide">
                        <div className="guide-box"></div>
                        <p>QR 코드를 사각형 안에 맞춰주세요</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
