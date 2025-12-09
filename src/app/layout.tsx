import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Import Outfit
import "./globals.css";

// Configure fonts
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "FacturaIA | Gestión Inteligente",
  description: "Procesa y gestiona tus facturas con inteligencia artificial de nueva generación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased text-gray-900 dark:text-gray-100 bg-background transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
