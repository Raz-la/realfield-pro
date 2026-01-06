'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-6">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-zinc-400 hover:text-bronze transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-zinc-50 font-semibold">{item.label}</span>
                    )}

                    {index < items.length - 1 && (
                        <ChevronLeft className="w-4 h-4 text-zinc-600" />
                    )}
                </div>
            ))}
        </nav>
    );
}
