'use client'

import { useState } from 'react'
import Camera from '../components/Camera'

export default function Home() {
    const [step, setStep] = useState('IDLE') // IDLE, CAPTURE_FRONT, CONFIRM_FRONT, CAPTURE_BACK, CONFIRM_BACK, GENERATING, DONE
    const [frontImage, setFrontImage] = useState(null)
    const [backImage, setBackImage] = useState(null)
    const [loading, setLoading] = useState(false)

    const startCapture = () => {
        setStep('CAPTURE_FRONT')
    }

    const handleFrontCapture = (image) => {
        setFrontImage(image)
        setStep('CONFIRM_FRONT')
    }

    const handleBackCapture = (image) => {
        setBackImage(image)
        setStep('CONFIRM_BACK')
    }

    const retakeFront = () => {
        setFrontImage(null)
        setStep('CAPTURE_FRONT')
    }

    const retakeBack = () => {
        setBackImage(null)
        setStep('CAPTURE_BACK')
    }

    const confirmFront = () => {
        setStep('CAPTURE_BACK')
    }

    const generatePDF = async () => {
        setLoading(true)
        setStep('GENERATING')
        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ frontImage, backImage }),
            })

            if (!response.ok) throw new Error('Error generando PDF')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'cedula.pdf'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            setStep('DONE')
        } catch (error) {
            console.error(error)
            alert('Hubo un error al generar el PDF')
            setStep('CONFIRM_BACK')
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setFrontImage(null)
        setBackImage(null)
        setStep('IDLE')
    }

    return (
        <main className="container flex flex-col items-center justify-center min-h-screen">
            <div className="card w-full max-w-2xl">
                <h1>Generador de PDF de Cédula</h1>

                {step === 'IDLE' && (
                    <div className="text-center">
                        <p className="mb-6">
                            Este sistema te permite capturar la parte frontal y trasera de tu cédula y generar un PDF listo para imprimir.
                        </p>
                        <button onClick={startCapture} className="btn text-lg px-8 py-3">
                            Comenzar
                        </button>
                    </div>
                )}

                {step === 'CAPTURE_FRONT' && (
                    <div>
                        <h2 className="text-xl mb-4 font-semibold">Capturar Frente</h2>
                        <Camera onCapture={handleFrontCapture} />
                    </div>
                )}

                {step === 'CONFIRM_FRONT' && frontImage && (
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl mb-4 font-semibold">Confirmar Frente</h2>
                        <img src={frontImage} alt="Frente" className="preview-image mb-4" />
                        <div className="flex gap-4 w-full justify-center">
                            <button onClick={retakeFront} className="btn bg-gray-500 hover:bg-gray-600">
                                Retomar
                            </button>
                            <button onClick={confirmFront} className="btn">
                                Continuar
                            </button>
                        </div>
                    </div>
                )}

                {step === 'CAPTURE_BACK' && (
                    <div>
                        <h2 className="text-xl mb-4 font-semibold">Capturar Reverso</h2>
                        <Camera onCapture={handleBackCapture} />
                    </div>
                )}

                {step === 'CONFIRM_BACK' && backImage && (
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl mb-4 font-semibold">Confirmar Reverso</h2>
                        <img src={backImage} alt="Reverso" className="preview-image mb-4" />
                        <div className="flex gap-4 w-full justify-center">
                            <button onClick={retakeBack} className="btn bg-gray-500 hover:bg-gray-600">
                                Retomar
                            </button>
                            <button onClick={generatePDF} className="btn" disabled={loading}>
                                {loading ? 'Generando...' : 'Generar PDF'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'GENERATING' && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p>Procesando imágenes y generando PDF...</p>
                    </div>
                )}

                {step === 'DONE' && (
                    <div className="text-center">
                        <h2 className="text-2xl text-green-600 mb-4">¡PDF Generado con Éxito!</h2>
                        <p className="mb-6">Tu descarga debería haber comenzado automáticamente.</p>
                        <button onClick={reset} className="btn">
                            Generar Nuevo
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}
