import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import InfiniteGrid from "@/components/InfiniteGrid";
import ChatWidget from "@/components/ChatWidget";

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
            <body className="antialiased">
                <InfiniteGrid />
                {children}
                <ChatWidget />
            </body>
        </html>
    );
}
