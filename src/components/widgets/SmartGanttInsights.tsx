'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Lightbulb, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ImpactedPhase {
    phaseId: string;
    phaseName: string;
    riskLevel: 'high' | 'medium' | 'low';
    estimatedDelay: number;
    reason: string;
}

interface SmartGanttInsightsProps {
    delayedPhases: string[];
    impactedPhases: ImpactedPhase[];
    recommendations: string[];
    cascadeImpact: string;
    isLoading: boolean;
}

export default function SmartGanttInsights({
    delayedPhases,
    impactedPhases,
    recommendations,
    cascadeImpact,
    isLoading,
}: SmartGanttInsightsProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (isLoading) {
        return (
            <div className="glass p-4 rounded-xl">
                <div className="flex items-center gap-2 text-bronze">
                    <TrendingUp className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-semibold">מנתח תלויות וסיכונים...</span>
                </div>
            </div>
        );
    }

    if (delayedPhases.length === 0) {
        return (
            <div className="glass p-4 rounded-xl border-2 border-green-500/30">
                <div className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-semibold">כל השלבים כרגע בזמן! 🎉</span>
                </div>
            </div>
        );
    }

    const riskColors = {
        high: 'text-red-400 bg-red-500/20 border-red-500/50',
        medium: 'text-orange-400 bg-orange-500/20 border-orange-500/50',
        low: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-xl border-2 border-magma/30"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-magma/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-magma" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">זוהתה שרשרת עיכובים</h3>
                        <p className="text-xs text-zinc-400">
                            {delayedPhases.length} שלבים מאחרים משפיעים על {impactedPhases.length} שלבים עתידיים
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-8 h-8 rounded-full hover:bg-bronze/20 transition-colors flex items-center justify-center"
                >
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4"
                    >
                        {/* Cascade Impact */}
                        <div className="bg-basalt/50 p-4 rounded-lg">
                            <p className="text-sm text-zinc-300">{cascadeImpact}</p>
                        </div>

                        {/* Impacted Phases */}
                        {impactedPhases.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-bronze mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    שלבים מושפעים
                                </h4>
                                <div className="space-y-2">
                                    {impactedPhases.map((phase, index) => (
                                        <motion.div
                                            key={phase.phaseId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-3 rounded-lg border ${riskColors[phase.riskLevel]}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="font-semibold text-sm">{phase.phaseName}</span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-black/30">
                                                    +{phase.estimatedDelay} ימים
                                                </span>
                                            </div>
                                            <p className="text-xs opacity-90">{phase.reason}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-bronze mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    המלצות AI
                                </h4>
                                <div className="space-y-2">
                                    {recommendations.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="flex items-start gap-3 p-3 bg-bronze/10 rounded-lg"
                                        >
                                            <span className="text-bronze font-bold text-sm">{index + 1}.</span>
                                            <p className="text-sm text-zinc-300 flex-1">{rec}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
