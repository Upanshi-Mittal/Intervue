import type { Metadata } from "next";
import {  Montserrat } from "next/font/google";
import "./globals.css";
import { QueryProvider } from '../providers/QueryProvider';
import { InitAuth } from './InitAuth';
import { NavbarWrapper } from './ui/NavbarWrapper';

const MontserratFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Intervue",
  description: "AI-powered interview analysis platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${MontserratFont.variable} antialiased`}
      >
        <QueryProvider>
          <InitAuth />
          <NavbarWrapper />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
