'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// Helper to center the crop initially
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState(null)
    const imgRef = useRef(null)
    const [loading, setLoading] = useState(false)

    function onImageLoad(e) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1.58))
    }

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) return

        setLoading(true)
        try {
            const canvas = document.createElement('canvas')
            const image = imgRef.current
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height

            canvas.width = completedCrop.width * scaleX
            canvas.height = completedCrop.height * scaleY

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            ctx.drawImage(
                image,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
            )

            const base64Image = canvas.toDataURL('image/jpeg')
            onCropComplete(base64Image)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-auto">
            <div className="flex-1 flex items-center justify-center p-4">
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={undefined} // Allow free-form cropping if desired, or set to 1.58
                >
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Crop me"
                        onLoad={onImageLoad}
                        style={{ maxHeight: '80vh', maxWidth: '100%' }}
                    />
                </ReactCrop>
            </div>

            <div className="bg-white p-4 flex flex-col gap-4 z-50 shrink-0">
                <p className="text-center text-sm text-gray-600">
                    Arrastra las esquinas para ajustar el recorte a la cédula.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="btn bg-gray-500 hover:bg-gray-600 flex-1"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn flex-1"
                        disabled={loading || !completedCrop}
                    >
                        {loading ? 'Procesando...' : 'Confirmar Recorte'}
                    </button>
                </div>
            </div>
        </div>
    )
}
