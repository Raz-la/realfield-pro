'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { updateProject } from '@/hooks/useFirestore';
import type { Project, BudgetSegment } from '@/types';

interface EditBudgetModalProps {
    project: Project;
    onClose: () => void;
}

export default function EditBudgetModal({ project, onClose }: EditBudgetModalProps) {
    const [budgetSegments, setBudgetSegments] = useState<BudgetSegment[]>(project.budget || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const hasInvalid = budgetSegments.some(seg =>
            !seg.name || seg.allocated < 0 || seg.spent < 0
        );

        if (hasInvalid) {
            alert('Please ensure all fields are valid');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProject(project.id, { budget: budgetSegments });
            onClose();
        } catch (error) {
            console.error('Error updating budget:', error);
            alert('Failed to update budget');
            setIsSubmitting(false);
        }
    };

    const updateSegment = (index: number, field: keyof BudgetSegment, value: any) => {
        const updated = [...budgetSegments];
        updated[index] = { ...updated[index], [field]: value };
        setBudgetSegments(updated);
    };

    const deleteSegment = (index: number) => {
        setBudgetSegments(budgetSegments.filter((_, i) => i !== index));
    };

    const addSegment = () => {
        setBudgetSegments([
            ...budgetSegments,
            {
                id: `segment-${Date.now()}`,
                name: 'New Segment',
                allocated: 0,
                spent: 0,
                color: '#D2691E',
            },
        ]);
    };

    const totalAllocated = budgetSegments.reduce((sum, seg) => sum + seg.allocated, 0);
    const totalSpent = budgetSegments.reduce((sum, seg) => sum + seg.spent, 0);

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
                    className="relative glass p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">Edit Budget</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-basalt rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-basalt/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Total Allocated</p>
                            <p className="text-2xl font-bold text-bronze">
                                ${totalAllocated.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-basalt/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-red-400">
                                ${totalSpent.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Budget Segments */}
                        <div className="space-y-4">
                            {budgetSegments.map((segment, index) => (
                                <div key={segment.id} className="bg-basalt/30 p-4 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        {/* Color Picker */}
                                        <input
                                            type="color"
                                            value={segment.color || '#D2691E'}
                                            onChange={(e) => updateSegment(index, 'color', e.target.value)}
                                            className="w-12 h-12 rounded cursor-pointer"
                                        />

                                        {/* Fields */}
                                        <div className="flex-1 grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={segment.name}
                                                    onChange={(e) => updateSegment(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Allocated</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={segment.allocated}
                                                    onChange={(e) => updateSegment(index, 'allocated', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Spent</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={segment.spent}
                                                    onChange={(e) => updateSegment(index, 'spent', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors text-sm"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={() => deleteSegment(index)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-3">
                                        <div className="h-2 bg-basalt rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${segment.allocated > 0 ? Math.min(100, (segment.spent / segment.allocated) * 100) : 0}%`,
                                                    backgroundColor: segment.color || '#D2691E',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Segment Button */}
                        <button
                            type="button"
                            onClick={addSegment}
                            className="w-full btn-secondary flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Segment
                        </button>

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
