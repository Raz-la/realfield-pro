'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useFirestore';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { projects, loading, error } = useProjects();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-bronze animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass p-8 rounded-xl text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">שגיאה בטעינת הפרויקטים</h2>
                    <p className="text-zinc-400">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 space-y-8">
            {/* 1. Header & Welcome Block */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        בוקר טוב, ישראל <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-zinc-400">
                        {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-bronze/20 hover:shadow-bronze/40"
                >
                    <Plus className="w-5 h-5" />
                    <span>פרויקט חדש</span>
                </button>
            </header>

            {/* 2. Bento Grid - High Level Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* Card 1: Total Projects */}
                <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-bronze/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-bronze/20" />
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">פרויקטים פעילים</h3>
                    <div className="text-4xl font-bold text-white">{projects.length}</div>
                    <div className="mt-4 flex items-center text-xs text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded-full">
                        <span className="ml-1">▲</span> +2 החודש
                    </div>
                </div>

                {/* Card 2: Reports Pending */}
                <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-magma/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-magma/20" />
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">דוחות פתוחים</h3>
                    <div className="text-4xl font-bold text-white">5</div>
                    <div className="mt-4 flex items-center text-xs text-magma-light bg-magma/10 w-fit px-2 py-1 rounded-full">
                        <span className="ml-1">!</span> דורש טיפול
                    </div>
                </div>

                {/* Card 3: Efficiency */}
                <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-forest/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-forest/30" />
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">ניצול תקציב</h3>
                    <div className="text-4xl font-bold text-white">92%</div>
                    <div className="mt-4 flex items-center text-xs text-zinc-400 bg-white/5 w-fit px-2 py-1 rounded-full">
                        במסגרת היעד
                    </div>
                </div>
            </motion.div>

            <div className="h-px bg-white/5 w-full my-8" />

            {/* 3. Projects Grid Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-bronze rounded-full" />
                        הפרויקטים שלי
                    </h2>
                    <button className="text-sm text-bronze hover:text-bronze-dark transition-colors">
                        הצג הכל
                    </button>
                </div>

                {projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass border-dashed border-2 border-white/10 p-16 rounded-2xl text-center"
                    >
                        <h3 className="text-2xl font-semibold mb-3 text-zinc-50">אין פרויקטים עדיין</h3>
                        <p className="text-zinc-400 mb-8 text-lg">
                            התחל על ידי יצירת פרויקט הבנייה הראשון שלך
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary inline-flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5" />
                            צור פרויקט ראשון
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {projects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </motion.div>
                )}
            </section>

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
            )}
        </div>
    );
}
