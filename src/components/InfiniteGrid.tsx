'use client';

import { motion } from 'framer-motion';

export default function InfiniteGrid() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Professional Grey Canvas Background */}
            <div className="absolute inset-0 bg-canvas" />

            {/* Subtle Animated Grid Pattern - 5% opacity for professional look */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(210, 105, 30, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(210, 105, 30, 0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
                animate={{
                    x: [0, 50],
                    y: [0, 50],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            {/* Very Subtle Gradient Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(210, 105, 30, 0.02) 0%, transparent 60%)',
                }}
            />
        </div>
    );
}
