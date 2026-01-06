import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Bright Golan Palette - High Contrast & Vivid
                'canvas': '#09090b',         // obsidian - Deep background
                'surface': '#18181b',        // basalt - Card background
                'surface-highlight': '#27272a', // lighter basalt for hover/active
                'glass-border': 'rgba(210, 105, 30, 0.2)', // Bronze tint border

                // Accents - Brighter & More Vivid
                bronze: '#F59E0B',           // Amber-500 equivalent (was D2691E) - Golden/Bronze pop
                'bronze-dark': '#D97706',    // Amber-600 for gradients
                forest: '#134E4A',           // Teal-900 (Deep Green)
                magma: '#FF5722',            // Deep Orange (Vivid Warning)
                'magma-light': '#FF7043',    // Lighter Orange
            },
            fontFamily: {
                heebo: ['Heebo', 'sans-serif'],
            },
            animation: {
                'grid-move': 'grid-move 20s linear infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
            },
            keyframes: {
                'grid-move': {
                    '0%': { transform: 'translate(0, 0)' },
                    '100%': { transform: 'translate(50px, 50px)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
