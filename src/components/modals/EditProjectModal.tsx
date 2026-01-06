'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { updateProject } from '@/hooks/useFirestore';
import type { Project } from '@/types';

interface EditProjectModalProps {
    project: Project;
    onClose: () => void;
}

export default function EditProjectModal({ project, onClose }: EditProjectModalProps) {
    const [formData, setFormData] = useState({
        name: project.name,
        client: project.client,
        address: project.address,
        logoUrl: project.logoUrl || '',
        status: project.status,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.client || !formData.address) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProject(project.id, formData);
            onClose();
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project');
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">Edit Project</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-basalt rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Project Address *
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Logo URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                            >
                                <option value="Active">Active</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary flex-1"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
