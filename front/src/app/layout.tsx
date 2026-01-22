import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className={`${inter.className} bg-gray-50`}>
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
