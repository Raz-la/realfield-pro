'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Project, Phase } from '@/types';
import { Calendar, Edit2 } from 'lucide-react';
import EditPhaseModal from '../modals/EditPhaseModal';
import SmartGanttInsights from './SmartGanttInsights';
import { useDependencyAnalysis } from '@/hooks/useDependencyAnalysis';

interface EditableGanttProps {
    project: Project;
}

export default function EditableGantt({ project }: EditableGanttProps) {
    const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

    // Get dependency analysis
    const { delayedPhases, impactedPhases, recommendations, cascadeImpact, isLoading } =
        useDependencyAnalysis(project);

    // Calculate date range for timeline
    const { startDate, endDate, totalDays } = useMemo(() => {
        if (!project.phases || project.phases.length === 0) {
            return { startDate: new Date(), endDate: new Date(), totalDays: 1 };
        }

        const allDates = project.phases.flatMap(p => [p.startDate, p.endDate]);
        const start = new Date(Math.min(...allDates.map(d => d.getTime())));
        const end = new Date(Math.max(...allDates.map(d => d.getTime())));
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;

        return { startDate: start, endDate: end, totalDays: days };
    }, [project.phases]);

    // Calculate position and width for each phase
    const getPhasePosition = (phase: Phase) => {
        const phaseStart = phase.startDate.getTime();
        const phaseEnd = phase.endDate.getTime();
        const timelineStart = startDate.getTime();

        const left = ((phaseStart - timelineStart) / (1000 * 60 * 60 * 24)) / totalDays * 100;
        const duration = (phaseEnd - phaseStart) / (1000 * 60 * 60 * 24);
        const width = (duration / totalDays) * 100;

        return { left: `${left}%`, width: `${width}%` };
    };

    // Calculate "Today" line position
    const getTodayPosition = () => {
        const now = new Date().getTime();
        const timelineStart = startDate.getTime();
        const position = ((now - timelineStart) / (1000 * 60 * 60 * 24)) / totalDays * 100;
        return Math.max(0, Math.min(100, position));
    };

    // Check if phase is late
    const isPhaseLate = (phase: Phase) => {
        const now = new Date();
        return phase.status !== 'Completed' && phase.endDate < now;
    };

    // Get risk level for a phase
    const getPhaseRiskLevel = (phaseId: string): 'high' | 'medium' | 'low' | null => {
        const impacted = impactedPhases.find(p => p.phaseId === phaseId);
        return impacted ? impacted.riskLevel : null;
    };

    // Status colors
    const statusColors = {
        Pending: 'bg-gray-500',
        'In Progress': 'bg-blue-500',
        Completed: 'bg-green-500',
    };

    return (
        <>
            {/* Smart Insights Panel */}
            <SmartGanttInsights
                delayedPhases={delayedPhases}
                impactedPhases={impactedPhases}
                recommendations={recommendations}
                cascadeImpact={cascadeImpact}
                isLoading={isLoading}
            />

            <div className="glass p-6 rounded-xl mt-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-bronze" />
                        Project Timeline
                    </h2>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    {/* Date Range */}
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{startDate.toLocaleDateString()}</span>
                        <span>{endDate.toLocaleDateString()}</span>
                    </div>

                    {/* Gantt Chart */}
                    <div className="relative min-h-[300px] pb-8">
                        {/* Today Line */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-bronze z-10"
                            style={{ left: `${getTodayPosition()}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-bronze font-semibold whitespace-nowrap">
                                Today
                            </div>
                        </div>

                        {/* Phase Bars */}
                        <div className="space-y-4">
                            {project.phases?.map((phase, index) => {
                                const position = getPhasePosition(phase);
                                const isLate = isPhaseLate(phase);
                                const riskLevel = getPhaseRiskLevel(phase.id);
                                const baseColor = phase.color || statusColors[phase.status];

                                // Determine color based on delay/risk status
                                let phaseColor = baseColor;
                                if (isLate) {
                                    phaseColor = '#ef4444'; // Red for delayed
                                } else if (riskLevel === 'high') {
                                    phaseColor = '#fb923c'; // Orange for high risk
                                } else if (riskLevel === 'medium') {
                                    phaseColor = '#fbbf24'; // Yellow for medium risk
                                }

                                return (
                                    <div key={phase.id} className="relative">
                                        {/* Phase Label */}
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-semibold">{phase.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${isLate ? 'bg-red-500/20 text-red-400' : 'bg-basalt text-gray-400'}`}>
                                                {phase.status}
                                            </span>
                                        </div>

                                        {/* Phase Bar Container */}
                                        <div className="relative h-12 bg-basalt/50 rounded-lg cursor-pointer group">
                                            <motion.div
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => setSelectedPhase(phase)}
                                                className="absolute h-full rounded-lg flex items-center px-3 hover:opacity-90 transition-all group-hover:shadow-lg"
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    backgroundColor: phaseColor,
                                                }}
                                            >
                                                <div className="flex items-center justify-between w-full text-white text-sm">
                                                    <span className="font-medium truncate">{phase.name}</span>
                                                    <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Dates */}
                                        <div className="mt-1 text-xs text-gray-500 flex justify-between" style={{ paddingLeft: position.left, width: `calc(100% - ${position.left})` }}>
                                            <span>{phase.startDate.toLocaleDateString()}</span>
                                            <span>{phase.endDate.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-bronze/20">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded bg-gray-500" />
                            <span>Pending</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded bg-blue-500" />
                            <span>In Progress</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded bg-green-500" />
                            <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded bg-red-500" />
                            <span>Late</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fb923c' }} />
                            <span>High Risk</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} />
                            <span>Medium Risk</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Phase Modal */}
            {selectedPhase && (
                <EditPhaseModal
                    project={project}
                    phase={selectedPhase}
                    onClose={() => setSelectedPhase(null)}
                />
            )}
        </>
    );
}
