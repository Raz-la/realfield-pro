'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Upload, Trash2, MapPin, Camera, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { createReport, updateReport } from '@/hooks/useFirestore';
import type { Report, PhotoItem } from '@/types';

interface ReportEditorModalProps {
    projectId: string;
    report: Report | null;
    onClose: () => void;
}

const PHASES = ['Skeleton', 'Finishing', 'Systems', 'Development'] as const;

export default function ReportEditorModal({ projectId, report, onClose }: ReportEditorModalProps) {
    const [formData, setFormData] = useState({
        title: report?.title || '',
        date: report?.date ? new Date(report.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        stopWork: report?.stopWork || false,
        location: report?.location || '',
        constructionPhase: report?.constructionPhase || 'Skeleton',
        generalOverview: report?.generalOverview || report?.content || '', // Fallback for legacy
        supervisorNotes: report?.supervisorNotes || '',
        rejects: report?.rejects || '',
        guidelines: report?.guidelines || '',
        safetyHighlights: report?.safetyHighlights || '',
    });

    const [photos, setPhotos] = useState<PhotoItem[]>(report?.photos || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Auto-fill context if new report
        if (!report) {
            setFormData(prev => ({
                ...prev,
                title: `דוח סיור - ${new Date().toLocaleDateString('he-IL')}`
            }));
        }
    }, [report]);

    const handleGeoTag = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
                }));
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title) {
            alert('אנא מלא כותרת לדוח');
            return;
        }

        setIsSubmitting(true);

        try {
            const reportData = {
                ...formData,
                projectId,
                date: new Date(formData.date),
                photos,
                // Sync legacy content field
                content: formData.generalOverview
            };

            if (report) {
                if (report.id) {
                    await updateReport(projectId, report.id, reportData);
                }
            } else {
                await createReport(projectId, reportData);
            }

            onClose();
        } catch (error) {
            console.error('Error saving report:', error);
            alert('שגיאה בשמירת הדוח');
            setIsSubmitting(false);
        }
    };

    const handlePhotoUrlAdd = () => {
        const url = prompt('הכנס קישור לתמונה (אינטגרציית מצלמה תתווסף בהמשך):');
        if (url) {
            setPhotos([
                ...photos,
                {
                    id: `photo-${Date.now()}`,
                    url,
                    timestamp: new Date(),
                    caption: ''
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

    // Helper for Section Headers
    const SectionHeader = ({ title, step }: { title: string, step: string }) => (
        <div className="p-4 rounded-lg mb-4 flex items-center justify-between bg-bronze/10 border border-bronze/30">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-bronze text-white">
                    {step}
                </div>
                <h3 className="font-bold text-white">{title}</h3>
            </div>
            <div className="w-2 h-2 rounded-full bg-bronze animate-pulse" />
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4" style={{ direction: 'rtl' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 100 }}
                    className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-4xl bg-zinc-900 md:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                >
                    {/* Sticky Header */}
                    <div className="p-4 bg-zinc-900 border-b border-white/10 flex items-center justify-between z-10 sticky top-0">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                        <h2 className="text-lg font-bold text-white">
                            {report ? 'ערוך דוח' : 'דוח סיור חדש'}
                        </h2>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="text-bronze font-bold text-sm disabled:opacity-50 px-4 py-2 bg-bronze/10 rounded-full"
                        >
                            {isSubmitting ? 'שומר...' : 'שמור'}
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">

                        {/* Section A: Context */}
                        <section>
                            <SectionHeader title="פרטי הדוח" step="A" />
                            <div className="space-y-4 px-2">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1">שם הדוח</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl focus:border-bronze focus:ring-1 focus:ring-bronze outline-none text-black font-medium placeholder-zinc-400"
                                        placeholder="שם הדוח..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">תאריך</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full h-12 px-4 bg-white border border-zinc-300 rounded-xl focus:border-bronze outline-none text-black"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGeoTag}
                                        className="h-12 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors mt-[1.35rem]"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        {formData.location ? 'מיקום זוהה' : 'הוסף מיקום'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Section B: Status */}
                        <section>
                            <SectionHeader title="סטטוס ביצוע" step="B" />
                            <div className="grid grid-cols-2 gap-3 px-2">
                                {PHASES.map((phase) => {
                                    const isSelected = formData.constructionPhase === phase;
                                    const labels: Record<string, string> = {
                                        'Skeleton': 'שלד',
                                        'Finishing': 'גמרים',
                                        'Systems': 'מערכות',
                                        'Development': 'פיתוח'
                                    };
                                    return (
                                        <button
                                            key={phase}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, constructionPhase: phase as any })}
                                            className={`h-12 rounded-xl text-sm font-bold transition-all ${isSelected
                                                ? 'bg-bronze text-white shadow-lg shadow-bronze/20 ring-2 ring-bronze ring-offset-2 ring-offset-zinc-900'
                                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {labels[phase]}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Section C: Inspection */}
                        <section>
                            <SectionHeader title="ממצאי הסיור" step="C" />
                            <div className="space-y-6 px-2">
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">תיאור כללי</label>
                                    <textarea
                                        value={formData.generalOverview}
                                        onChange={(e) => setFormData({ ...formData, generalOverview: e.target.value })}
                                        className="w-full p-4 bg-white border border-zinc-300 rounded-xl text-black min-h-[100px] focus:border-bronze outline-none resize-none text-base placeholder-zinc-400"
                                        placeholder="הגעתי לאתר, קבלן נוכח..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">הערות המפקח</label>
                                    <textarea
                                        value={formData.supervisorNotes}
                                        onChange={(e) => setFormData({ ...formData, supervisorNotes: e.target.value })}
                                        className="w-full p-4 bg-white border border-zinc-300 rounded-xl text-black min-h-[100px] focus:border-bronze outline-none resize-none text-base placeholder-zinc-400"
                                        placeholder="פירוט הממצאים העיקריים..."
                                    />
                                </div>
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <label className="flex items-center gap-2 text-sm font-bold text-red-400 mb-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        ריג'קטים לטיפול מיידי
                                    </label>
                                    <textarea
                                        value={formData.rejects}
                                        onChange={(e) => setFormData({ ...formData, rejects: e.target.value })}
                                        className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-black min-h-[100px] focus:border-red-500 outline-none resize-none text-base placeholder-red-300"
                                        placeholder="רשימת ליקויים קריטיים..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2">הנחיות להמשך</label>
                                    <textarea
                                        value={formData.guidelines}
                                        onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                                        className="w-full p-4 bg-white border border-zinc-300 rounded-xl text-black min-h-[100px] focus:border-bronze outline-none resize-none text-base placeholder-zinc-400"
                                        placeholder="הוראות ביצוע לשלב הבא..."
                                    />
                                </div>
                                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                    <label className="flex items-center gap-2 text-sm font-bold text-orange-400 mb-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        דגשי בטיחות
                                    </label>
                                    <textarea
                                        value={formData.safetyHighlights}
                                        onChange={(e) => setFormData({ ...formData, safetyHighlights: e.target.value })}
                                        className="w-full p-4 bg-orange-50 border border-orange-200 rounded-xl text-black min-h-[80px] focus:border-orange-500 outline-none resize-none text-base placeholder-orange-300"
                                        placeholder="עבירות בטיחות או דגשים..."
                                    />
                                    {/* Stop Work Toggle */}
                                    <div className="mt-4 pt-4 border-t border-orange-500/20">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className={`font-bold ${formData.stopWork ? 'text-red-500' : 'text-zinc-400'}`}>
                                                {formData.stopWork ? 'צו הפסקת עבודה פעיל!' : 'האם להוציא צו הפסקת עבודה?'}
                                            </span>
                                            <div className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.stopWork ? 'bg-red-500' : 'bg-zinc-700'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.stopWork}
                                                    onChange={(e) => setFormData({ ...formData, stopWork: e.target.checked })}
                                                />
                                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${formData.stopWork ? 'translate-x-0' : '-translate-x-6'}`} />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section D: Photos */}
                        <section>
                            <SectionHeader title="תיעוד מהשטח" step="D" />
                            <div className="px-2">
                                <button
                                    type="button"
                                    onClick={handlePhotoUrlAdd}
                                    className="w-full h-16 mb-6 flex items-center justify-center gap-3 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-2xl text-zinc-400 hover:text-bronze hover:border-bronze transition-all group"
                                >
                                    <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold">הוסף תמונה (URL)</span>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {photos.map((photo, index) => (
                                        <div key={photo.id} className="bg-zinc-800 rounded-2xl overflow-hidden shadow-lg border border-zinc-700">
                                            <div className="relative aspect-[4/3]">
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
                                                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded-md text-xs font-mono text-white/80">
                                                    Img {index + 1}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <input
                                                    type="text"
                                                    value={photo.caption || ''}
                                                    onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                                                    placeholder="רשום הערה לתמונה..."
                                                    className="w-full px-2 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-white/50 focus:border-bronze focus:bg-black/50 focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Mobile Safe Area Spacer */}
                        <div className="h-8" />
                    </div>

                    {/* Footer Actions (Desktop Only - Mobile header handles save) */}
                    <div className="hidden md:flex p-4 border-t border-white/10 justify-end gap-3 bg-zinc-900">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-bronze hover:bg-bronze-light text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-bronze/20"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {report ? 'שמור שינויים' : 'צור דוח'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
