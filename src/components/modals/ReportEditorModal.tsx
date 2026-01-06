'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { createReport, updateReport } from '@/hooks/useFirestore';
import type { Report, PhotoItem } from '@/types';

interface ReportEditorModalProps {
    projectId: string;
    report: Report | null;
    onClose: () => void;
}

export default function ReportEditorModal({ projectId, report, onClose }: ReportEditorModalProps) {
    const [formData, setFormData] = useState({
        title: report?.title || '',
        date: report?.date ? new Date(report.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        stopWork: report?.stopWork || false,
        content: report?.content || '',
    });
    const [photos, setPhotos] = useState<PhotoItem[]>(report?.photos || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const reportData = {
                ...formData,
                date: new Date(formData.date),
                photos,
            };

            if (report) {
                await updateReport(projectId, report.id, reportData);
            } else {
                await createReport(projectId, reportData);
            }

            onClose();
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report');
            setIsSubmitting(false);
        }
    };

    const handlePhotoUrlAdd = () => {
        const url = prompt('Enter photo URL:');
        if (url) {
            setPhotos([
                ...photos,
                {
                    id: `photo-${Date.now()}`,
                    url,
                    timestamp: new Date(),
                },
            ]);
        }
    };

    const handlePhotoDelete = (photoId: string) => {
        setPhotos(photos.filter(p => p.id !== photoId));
    };

    const updatePhotoCaption = (photoId: string, caption: string) => {
        setPhotos(photos.map(p => p.id === photoId ? { ...p, caption } : p));
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
                    className="relative glass p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">
                            {report ? 'Edit Report' : 'Create New Report'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-basalt rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Report Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                placeholder="e.g., Weekly Progress Report - Week 5"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-bronze">
                                    Report Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors"
                                    required
                                />
                            </div>

                            {/* Stop Work Toggle */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-bronze">
                                    Stop Work Order
                                </label>
                                <label className="flex items-center gap-3 px-4 py-3 bg-basalt border border-bronze/30 rounded-lg cursor-pointer hover:border-bronze transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.stopWork}
                                        onChange={(e) => setFormData({ ...formData, stopWork: e.target.checked })}
                                        className="w-5 h-5 accent-red-500"
                                    />
                                    <span className={formData.stopWork ? 'text-red-400 font-semibold' : 'text-gray-400'}>
                                        {formData.stopWork ? 'Stop Work Active' : 'Normal Operation'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-bronze">
                                Report Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 bg-basalt border border-bronze/30 rounded-lg focus:outline-none focus:border-bronze transition-colors min-h-[200px] resize-y"
                                placeholder="Enter detailed report content here..."
                                required
                            />
                        </div>

                        {/* Photo Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-bronze">
                                    Photos ({photos.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={handlePhotoUrlAdd}
                                    className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Add Photo URL
                                </button>
                            </div>

                            {photos.length === 0 ? (
                                <div className="border-2 border-dashed border-bronze/30 rounded-lg p-8 text-center">
                                    <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No photos added yet</p>
                                    <button
                                        type="button"
                                        onClick={handlePhotoUrlAdd}
                                        className="mt-3 text-bronze hover:text-bronze/80 text-sm font-semibold"
                                    >
                                        Add your first photo
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {photos.map((photo) => (
                                        <div key={photo.id} className="bg-basalt/30 rounded-lg overflow-hidden group">
                                            <div className="relative aspect-video">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption || 'Report photo'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%2318181b"/><text x="50%" y="50%" text-anchor="middle" fill="%23666" font-size="20">Image not found</text></svg>';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handlePhotoDelete(photo.id)}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <input
                                                    type="text"
                                                    value={photo.caption || ''}
                                                    onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                                                    placeholder="Add caption..."
                                                    className="w-full px-2 py-1 bg-basalt border border-bronze/30 rounded text-sm focus:outline-none focus:border-bronze transition-colors"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    report ? 'Save Changes' : 'Create Report'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
