import "./globals.css";

export const metadata = {
  title: "AcademiCode — Plataforma Académica UNERG",
  description:
    "Plataforma web para el mejoramiento del rendimiento académico en programación. Genera hojas de ruta personalizadas con IA para estudiantes de Ingeniería en Sistemas de la UNERG.",
  keywords: "UNERG, programación, aprendizaje, IA, hoja de ruta, Venezuela",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
