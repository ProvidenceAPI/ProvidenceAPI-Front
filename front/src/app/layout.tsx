import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "src/contexts/AppContext";
import { CalendarProvider } from "src/contexts/CalendarContext";
import { Footer } from "src/components/Footer";
import { Navbar } from "src/components/Navbar";

// Configura Montserrat como fuente principal (Sans-serif moderna)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

// Opcional: Mantener Inter para texto de cuerpo si lo prefieres
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Providence Fitness",
  description: "Transforma tu cuerpo, transforma tu vida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${montserrat.variable} ${inter.variable}`}>
      <body
        className={`${montserrat.className} bg-gray-50 antialiased`}
        suppressHydrationWarning
      >
        <AppProvider>
          <CalendarProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </CalendarProvider>
        </AppProvider>
      </body>
    </html>
  );
}