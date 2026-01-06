'use client';

import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Settings,
    LogOut,
    User,
    Building2,
    HardHat
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'לוח בקרה', href: '/dashboard' },
        { icon: FolderKanban, label: 'פרויקטים', href: '/projects' }, // Using placeholder route
        { icon: FileText, label: 'דוחות', href: '/reports' },       // Using placeholder route
        { icon: Settings, label: 'הגדרות', href: '/settings' },     // Using placeholder route
    ];

    return (
        <aside className="fixed right-0 top-0 h-screen w-64 bg-surface/40 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col">
            {/* Logo Area */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 text-zinc-50 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center shadow-lg shadow-bronze/20">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">RealField<span className="text-bronze">Pro</span></span>
                </div>
                <p className="text-xs text-zinc-500 mr-14">Construction OS 2.0</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <div className="text-xs font-semibold text-zinc-500 mb-4 px-4 uppercase tracking-wider">
                    תפריט ראשי
                </div>

                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href === '/dashboard' ? '/dashboard' : '#'} // Disable non-active links for demo
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-bronze/10 text-bronze border border-bronze/20'
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-bronze' : 'text-zinc-400 group-hover:text-zinc-100'}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="mr-auto w-1.5 h-1.5 rounded-full bg-bronze shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile - Bento Card Style */}
            <div className="p-4 mt-auto">
                <div className="p-4 rounded-xl bg-gradient-to-b from-surface to-surface-highlight border border-white/5 flex items-center gap-3 cursor-pointer hover:border-bronze/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-bronze/50 transition-colors">
                        <User className="w-5 h-5 text-zinc-400 group-hover:text-bronze" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold text-zinc-200 truncate">ישראל ישראלי</h4>
                        <p className="text-xs text-zinc-500 truncate">מנהל פרויקט בכיר</p>
                    </div>
                    <LogOut className="w-4 h-4 text-zinc-600 hover:text-magma transition-colors" />
                </div>
            </div>
        </aside>
    );
}
