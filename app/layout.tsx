import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Real-Time Performance Dashboard",
  description: "A high-performance dashboard for visualizing real-time data streams using custom-built charts with React and Canvas. It is designed to render over 10,000 data points at 60fps.",
  manifest: "/manifest.json",
  themeColor: "#0D1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-slate-900 text-slate-300 antialiased`}>
        {children}
      </body>
    </html>
  );
}
