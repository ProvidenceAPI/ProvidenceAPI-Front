import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "../components/ClientLayout";
import "./globals.css";

import AppProvider from "src/contexts/AppContext";
import { CalendarProvider } from "src/contexts/CalendarContext";


import { Footer } from "src/components/Footer";
import { Navbar } from "src/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50`} suppressHydrationWarning>
        {/* APP PROVIDER (Auth + Admin + Cart) */}
        <AppProvider>
          {/* CALENDAR PROVIDER (Reservations + Turns) */}
          <CalendarProvider>
            <div className="min-h-screen flex flex-col">
              {/* NAVBAR - SIEMPRE VISIBLE */}
              <Navbar/>
              
              {/* CONTENIDO PRINCIPAL */}
              <main className="flex-grow">
                {children}
              </main>
              
              {/* CTA Y FOOTER - SIEMPRE VISIBLES */}
             
              <Footer />
            </div>
          </CalendarProvider>
        </AppProvider>
      </body>
    </html>
  );
}
