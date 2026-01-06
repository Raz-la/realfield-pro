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

    const statusColors = {
        Active: 'bg-green-500/20 text-green-400 border-green-500/30',
        'On Hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="glass p-6 rounded-xl cursor-pointer group relative overflow-hidden"
            >
                {/* Bronze Accent Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bronze to-transparent" />

                {/* Context Menu Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowContextMenu(!showContextMenu);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-basalt transition-colors"
                >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>

                {/* Context Menu */}
                {showContextMenu && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-14 right-4 glass rounded-lg p-2 z-10 min-w-[150px]"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEditModal(true);
                                setShowContextMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bronze/20 transition-colors text-left"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                                setShowContextMenu(false);
                            }}
                            disabled={isDeleting}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 text-left"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )}

                {/* Logo or Icon */}
                <div className="mb-4">
                    {project.logoUrl ? (
                        <img
                            src={project.logoUrl}
                            alt={project.name}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-bronze/10 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-bronze" />
                        </div>
                    )}
                </div>

                {/* Project Info */}
                <h3 className="text-2xl font-bold mb-2 group-hover:text-bronze transition-colors">
                    {project.name}
                </h3>
                <p className="text-gray-400 mb-1">
                    <span className="text-bronze font-semibold">Client:</span> {project.client}
                </p>
                <p className="text-gray-400 mb-4 text-sm line-clamp-2">
                    <span className="text-bronze font-semibold">Location:</span> {project.address}
                </p>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.status]}`}>
                        {project.status}
                    </span>

                    {project.lastOpenedAt && (
                        <span className="text-xs text-gray-500">
                            Last opened: {new Date(project.lastOpenedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-bronze/0 to-bronze/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
