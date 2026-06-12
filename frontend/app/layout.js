/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import GlobalParticles from '@/components/GlobalParticles';

export const metadata = {
  title: "AcademiCode — Plataforma Académica UNERG",
  description:
    "Plataforma web para el mejoramiento del rendimiento académico en programación. Genera hojas de ruta personalizadas con IA para estudiantes de Ingeniería en Sistemas de la UNERG.",
  keywords: "UNERG, programación, aprendizaje, IA, hoja de ruta, Venezuela",
  icons: {
    icon: "/logo-academicode.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0b1326" />
      </head>
      <body>
        <GlobalParticles />
        {children}
      </body>
    </html>
  );
}
