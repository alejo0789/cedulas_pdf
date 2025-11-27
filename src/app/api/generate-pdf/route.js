import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { frontImage, backImage } = await req.json()

        if (!frontImage || !backImage) {
            return NextResponse.json(
                { error: 'Se requieren ambas imágenes (frente y reverso)' },
                { status: 400 }
            )
        }

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
        const { width, height } = page.getSize()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

        // Helper to decode base64 image
        const decodeImage = (dataUrl) => {
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
            return Buffer.from(base64Data, 'base64')
        }

        const frontBuffer = decodeImage(frontImage)
        const backBuffer = decodeImage(backImage)

        // Embed images
        let frontImg, backImg
        try {
            frontImg = await pdfDoc.embedJpg(frontBuffer)
        } catch (e) {
            frontImg = await pdfDoc.embedPng(frontBuffer)
        }

        try {
            backImg = await pdfDoc.embedJpg(backBuffer)
        } catch (e) {
            backImg = await pdfDoc.embedPng(backBuffer)
        }

        const imgWidth = 400
        const imgHeight = 250

        // Draw Title
        page.drawText('', {
            x: 50,
            y: height - 50,
            size: 20,
            font: font,
            color: rgb(0, 0, 0),
        })

        // Draw Front Image
        page.drawText('', {
            x: 50,
            y: height - 100,
            size: 14,
            font: font,
        })

        // Scale image to fit within dimensions while maintaining aspect ratio
        const frontDims = frontImg.scaleToFit(imgWidth, imgHeight)

        page.drawImage(frontImg, {
            x: (width - frontDims.width) / 2,
            y: height - 120 - frontDims.height,
            width: frontDims.width,
            height: frontDims.height,
        })

        // Draw Back Image
        const secondSectionY = height - 120 - frontDims.height - 50

        page.drawText('', {
            x: 50,
            y: secondSectionY,
            size: 14,
            font: font,
        })

        const backDims = backImg.scaleToFit(imgWidth, imgHeight)

        page.drawImage(backImg, {
            x: (width - backDims.width) / 2,
            y: secondSectionY - 20 - backDims.height,
            width: backDims.width,
            height: backDims.height,
        })

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()

        // Return the PDF
        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=cedula.pdf',
            },
        })

    } catch (error) {
        console.error('Error generating PDF:', error)
        return NextResponse.json(
            { error: 'Error interno al generar el PDF: ' + error.message },
            { status: 500 }
        )
    }
}
