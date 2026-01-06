'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { MoreVertical, Edit, Trash2, Building2 } from 'lucide-react';
import { deleteProject } from '@/hooks/useFirestore';
import EditProjectModal from './modals/EditProjectModal';

interface ProjectCardProps {
    project: Project;
    index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
    const router = useRouter();
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;

        setIsDeleting(true);
        try {
            await deleteProject(project.id);
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
            setIsDeleting(false);
        }
    };

    // Bento Palette Status Colors
    const statusColors = {
        Active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
        'On Hold': 'bg-bronze/10 text-bronze border border-bronze/20',
        Completed: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="bg-surface hover:bg-surface-highlight border border-white/5 hover:border-bronze/30 p-5 rounded-2xl cursor-pointer group relative shadow-lg hover:shadow-2xl hover:shadow-black/50 transition-all duration-300"
            >
                {/* Header Row: Icon + Date */}
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        {project.logoUrl ? (
                            <img
                                src={project.logoUrl}
                                alt={project.name}
                                className="w-14 h-14 rounded-xl object-cover shadow-md"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bronze/10 to-bronze/5 flex items-center justify-center border border-white/5 group-hover:border-bronze/30 transition-colors">
                                <Building2 className="w-7 h-7 text-bronze group-hover:text-white transition-colors" />
                            </div>
                        )}
                        {/* Status Indicator Dot */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${project.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowContextMenu(!showContextMenu);
                        }}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Project Info */}
                <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-bronze transition-colors truncate">
                        {project.name}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                        {project.client} • {project.address}
                    </p>
                </div>

                {/* Footer: Status Badge + Date */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[project.status] || statusColors.Active}`}>
                        {project.status}
                    </span>

                    {project.lastOpenedAt && (
                        <span className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors font-mono">
                            {new Date(project.lastOpenedAt).toLocaleDateString('he-IL')}
                        </span>
                    )}
                </div>

                {/* Context Menu */}
                {showContextMenu && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-12 left-4 bg-surface-highlight border border-white/10 shadow-xl rounded-xl p-1.5 z-20 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEditModal(true);
                                setShowContextMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-left text-zinc-300"
                        >
                            <Edit className="w-4 h-4" />
                            <span>ערוך</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                                setShowContextMenu(false);
                            }}
                            disabled={isDeleting}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-magma/10 transition-colors text-sm text-magma text-left"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>{isDeleting ? 'מוחק...' : 'מחק'}</span>
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Edit Modal */}
            {showEditModal && (
                <EditProjectModal
                    project={project}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </>
    );
}
