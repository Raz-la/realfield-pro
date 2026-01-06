'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProject, useReports, touchProject } from '@/hooks/useFirestore';
import { ArrowRight, Loader2, Building2 } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import EditableGantt from '@/components/widgets/EditableGantt';
import DynamicBudget from '@/components/widgets/DynamicBudget';
import ReportsList from '@/components/ReportsList';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const { project, loading, error } = useProject(projectId);
    const { reports } = useReports(projectId);

    // Update lastOpenedAt when project is loaded
    useEffect(() => {
        if (project) {
            touchProject(projectId);
        }
    }, [project, projectId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-bronze animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass p-8 rounded-xl text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">פרויקט לא נמצא</h2>
                    <p className="text-zinc-400 mb-4">{error?.message || 'הפרויקט המבוקש אינו קיים.'}</p>
                    <button onClick={() => router.push('/dashboard')} className="btn-primary">
                        חזרה ללוח הבקרה
                    </button>
                </div>
            </div>
        );
    }

    const statusColors = {
        Active: 'text-green-400',
        'On Hold': 'text-yellow-400',
        Completed: 'text-blue-400',
    };

    return (
        <div className="min-h-screen p-8">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={[
                { label: 'ראשי', href: '/dashboard' },
                { label: 'פרויקטים', href: '/dashboard' },
                { label: project.name }
            ]} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-bronze hover:text-bronze-light mb-4 transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                    חזרה ללוח הבקרה
                </button>

                <div className="glass p-6 rounded-xl">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {project.logoUrl ? (
                                <img
                                    src={project.logoUrl}
                                    alt={project.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-bronze/10 flex items-center justify-center">
                                    <Building2 className="w-10 h-10 text-bronze" />
                                </div>
                            )}

                            <div>
                                <h1 className="text-4xl font-bold mb-2 text-zinc-50">{project.name}</h1>
                                <p className="text-zinc-400">
                                    <span className="text-bronze font-semibold">לקוח:</span> {project.client}
                                </p>
                                <p className="text-zinc-400 text-sm">
                                    <span className="text-bronze font-semibold">מיקום:</span> {project.address}
                                </p>
                            </div>
                        </div>

                        <span className={`text-lg font-semibold ${statusColors[project.status]}`}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Living Widgets Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
            >
                <EditableGantt project={project} />
                <DynamicBudget project={project} />
            </motion.div>

            {/* Reports Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <ReportsList projectId={projectId} reports={reports} />
            </motion.div>
        </div>
    );
}
