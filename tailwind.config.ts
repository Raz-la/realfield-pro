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
                // Daytime Basalt - Professional Grey/Stone Palette
                'canvas': '#18181b',         // zinc-900 - Soft deep grey background
                'surface': '#27272a',        // zinc-800 - Card/surface color
                'surface-light': '#3f3f46',  // zinc-700 - Lighter surface elements  
                bronze: '#D2691E',           // Primary accent - unchanged
                'bronze-light': '#E07B2E',   // Lighter bronze for hovers
                forest: '#2F4F4F',           // Secondary - unchanged
                magma: '#FF4500',            // Alert/danger - unchanged
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
