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
        <div className="min-h-screen p-8">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={[{ label: 'ראשי' }]} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-bold mb-3 text-zinc-50">
                            RealField Pro
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            לוח בקרה לניהול פרויקטי בנייה
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center gap-3">
                        <Plus className="w-5 h-5" />
                        פרויקט חדש
                    </button>
                </div>
            </motion.div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass p-16 rounded-xl text-center"
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </motion.div>
            )}

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
            )}
        </div>
    );
}
