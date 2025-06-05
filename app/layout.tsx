import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import NavbarClient from "@/components/NavbarClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Film Sitesi",
  description: "Film ve dizi izleme platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[#0a0a0a] min-h-screen text-white`}>
        <div className="min-h-screen">
          <NavbarClient />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
