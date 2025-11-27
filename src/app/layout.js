import './globals.css'

export const metadata = {
    title: 'Generador de PDF de Cédulas',
    description: 'Captura y genera PDF de cédulas',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    )
}
