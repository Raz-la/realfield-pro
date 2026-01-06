'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Report } from '@/types';
import { FileText, Plus, Calendar, AlertTriangle, Edit, Trash2, Download } from 'lucide-react';
import { deleteReport } from '@/hooks/useFirestore';
import ReportEditorModal from './modals/ReportEditorModal';

interface ReportsListProps {
    projectId: string;
    reports: Report[];
}

export default function ReportsList({ projectId, reports }: ReportsListProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortedReports = [...reports].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const handleDelete = async (reportId: string, reportTitle: string) => {
        if (!confirm(`Are you sure you want to delete "${reportTitle}"?`)) return;

        try {
            await deleteReport(projectId, reportId);
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Failed to delete report');
        }
    };

    const handleExportPDF = (report: Report) => {
        // Simple PDF export using window.print
        // In production, you'd use a library like jsPDF or react-pdf
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #D2691E; }
              .meta { color: #666; margin-bottom: 20px; }
              .content { margin: 20px 0; white-space: pre-wrap; }
              .photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
              .photos img { width: 100%; border-radius: 8px; }
              .stop-work { background: #ff4444; color: white; padding: 10px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <div class="meta">
              <p><strong>Date:</strong> ${new Date(report.date).toLocaleDateString()}</p>
              ${report.stopWork ? '<div class="stop-work"><strong>⚠ STOP WORK ORDER</strong></div>' : ''}
            </div>
            <div class="content">${report.content}</div>
            ${report.photos.length > 0 ? `
              <h2>Photos</h2>
              <div class="photos">
                ${report.photos.map(photo => `
                  <div>
                    <img src="${photo.url}" alt="${photo.caption || 'Report photo'}" />
                    ${photo.caption ? `<p>${photo.caption}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <>
            <div className="glass p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-bronze" />
                        <h2 className="text-2xl font-bold">Reports</h2>
                        <span className="text-sm text-gray-400">({reports.length})</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="btn-secondary text-sm px-3 py-2"
                        >
                            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Report
                        </button>
                    </div>
                </div>

                {/* Reports List */}
                {sortedReports.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                        <p className="text-gray-400 mb-6">
                            Create your first project report to document progress
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Report
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedReports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-basalt/30 p-4 rounded-lg hover:bg-basalt/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{report.title}</h3>
                                            {report.stopWork && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Stop Work
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(report.date).toLocaleDateString()}
                                            </span>
                                            {report.photos.length > 0 && (
                                                <span>{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-gray-400 text-sm line-clamp-2">
                                            {report.content}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="p-2 hover:bg-bronze/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-bronze" />
                                        </button>
                                        <button
                                            onClick={() => handleExportPDF(report)}
                                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title="Export PDF"
                                        >
                                            <Download className="w-4 h-4 text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(report.id, report.title)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Report Modal */}
            {(isCreating || selectedReport) && (
                <ReportEditorModal
                    projectId={projectId}
                    report={selectedReport}
                    onClose={() => {
                        setIsCreating(false);
                        setSelectedReport(null);
                    }}
                />
            )}
        </>
    );
}
