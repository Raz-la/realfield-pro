'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { updateProject } from '@/hooks/useFirestore';
import type { Project, Phase } from '@/types';

interface EditPhaseModalProps {
    project: Project;
    phase: Phase;
    onClose: () => void;
}

export default function EditPhaseModal({ project, phase, onClose }: EditPhaseModalProps) {
    const [formData, setFormData] = useState({
        startDate: phase.startDate.toISOString().split('T')[0],
        endDate: phase.endDate.toISOString().split('T')[0],
        status: phase.status,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            alert('End date must be after start date');
            return;
        }

        setIsSubmitting(true);
        try {
            // Update the specific phase
            const updatedPhases = project.phases.map(p =>
                p.id === phase.id
                    ? {
                        ...p,
                        startDate: new Date(formData.startDate),
                        endDate: new Date(formData.endDate),
                        status: formData.status as Phase['status'],
                    }
                    : p
            );

            await updateProject(project.id, { phases: updatedPhases });
            onClose();
        } catch (error) {
            console.error('Error updating phase:', error);
            alert('Failed to update phase');
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
                    className="relative glass p-8 rounded-2xl max-w-md w-full"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Edit Phase: {phase.name}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-basalt rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Phase['status'] })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
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
