import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import InfiniteGrid from "@/components/InfiniteGrid";
import ChatWidget from "@/components/ChatWidget";
import Sidebar from "@/components/Sidebar";

const heebo = Heebo({
    subsets: ["latin", "hebrew"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "RealField Pro - Construction Management",
    description: "High-Fidelity Construction Management SaaS with Anti-Gravity Philosophy",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl" className={heebo.className}>
            <body className="antialiased bg-canvas text-zinc-50 overflow-x-hidden">
                <InfiniteGrid />

                {/* Sidebar - Fixed Right */}
                <Sidebar />

                {/* Main Content - Pushed Left (for RTL) */}
                <main className="mr-64 min-h-screen relative z-10 transition-all duration-300">
                    {children}
                </main>

                <ChatWidget />
            </body>
        </html>
    );
}
