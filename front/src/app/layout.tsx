// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthWrapper from "src/components/AuthWrappe";// Nuevo nombre

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Providence Fitness",
  description: "Dashboard de Providence Fitness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}