'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { createProject } from '@/hooks/useFirestore';
import type { Project } from '@/types';

interface CreateProjectModalProps {
    onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        address: '',
        logoUrl: '',
        status: 'Active' as Project['status'],
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
            await createProject({
                ...formData,
                phases: [
                    {
                        id: '1',
                        name: 'Foundation',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        status: 'Pending',
                        color: '#8B4513',
                    },
                    {
                        id: '2',
                        name: 'Skeleton',
                        startDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
                        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                        status: 'Pending',
                        color: '#A9A9A9',
                    },
                    {
                        id: '3',
                        name: 'Finishing',
                        startDate: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000),
                        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        status: 'Pending',
                        color: '#D2691E',
                    },
                ],
                budget: [
                    { id: '1', name: 'Foundation', allocated: 100000, spent: 0, color: '#8B4513' },
                    { id: '2', name: 'Skeleton', allocated: 150000, spent: 0, color: '#A9A9A9' },
                    { id: '3', name: 'Finishing', allocated: 100000, spent: 0, color: '#D2691E' },
                    { id: '4', name: 'Contingency', allocated: 50000, spent: 0, color: '#FF4500' },
                ],
            });
            onClose();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">Create New Project</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-basalt rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                placeholder="e.g., Downtown Office Complex"
                                required
                            />
                        </div>

                        {/* Client Name */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                placeholder="e.g., ABC Corporation"
                                required
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Project Address *
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                placeholder="e.g., 123 Main St, New York, NY 10001"
                                required
                            />
                        </div>

                        {/* Logo URL */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Logo URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Initial Status
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

                        {/* Actions */}
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
                                        Creating...
                                    </>
                                ) : (
                                    'Create Project'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
