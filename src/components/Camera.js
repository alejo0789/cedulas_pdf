'use client'

import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
};

export default function Camera({ onCapture }) {
    const webcamRef = useRef(null)
    const [error, setError] = useState(null)
    const [mirrored, setMirrored] = useState(false)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
            onCapture(imageSrc)
        }
    }, [webcamRef, onCapture])

    const handleUserMediaError = useCallback((err) => {
        console.error(err)
        if (err.name === 'NotAllowedError') {
            setError('Acceso a la cámara denegado. Por favor permite el acceso.')
        } else if (err.name === 'NotFoundError') {
            setError('No se encontró ninguna cámara.')
        } else {
            setError('Error al acceder a la cámara. Asegúrate de estar usando HTTPS o localhost.')
        }
    }, [])

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
                <p className="font-bold">Error de Cámara</p>
                <p>{error}</p>
                <p className="text-sm mt-2 text-gray-600">
                    Nota: Si estás en un móvil, asegúrate de acceder vía HTTPS.
                </p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '380px',
                aspectRatio: '16/9',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '2px solid #d1d5db',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
            }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMediaError={handleUserMediaError}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: mirrored ? 'scaleX(-1)' : 'none'
                    }}
                />
            </div>

            <div className="flex gap-2 items-center">
                <input
                    type="checkbox"
                    id="mirror-mode"
                    checked={mirrored}
                    onChange={(e) => setMirrored(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="mirror-mode" className="text-sm text-gray-700 cursor-pointer select-none">
                    Modo Espejo (Solo vista previa)
                </label>
            </div>

            <button onClick={capture} className="btn" style={{ width: '100%', maxWidth: '380px' }}>
                Capturar Foto
            </button>
        </div>
    )
}
