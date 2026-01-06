import { useState, useEffect } from 'react';
import { Project } from '@/types';

interface ImpactedPhase {
    phaseId: string;
    phaseName: string;
    riskLevel: 'high' | 'medium' | 'low';
    estimatedDelay: number;
    reason: string;
}

interface DependencyAnalysis {
    delayedPhases: string[];
    impactedPhases: ImpactedPhase[];
    recommendations: string[];
    cascadeImpact: string;
    isLoading: boolean;
    error: string | null;
}

export function useDependencyAnalysis(project: Project | null): DependencyAnalysis {
    const [analysis, setAnalysis] = useState<DependencyAnalysis>({
        delayedPhases: [],
        impactedPhases: [],
        recommendations: [],
        cascadeImpact: '',
        isLoading: false,
        error: null,
    });

    useEffect(() => {
        if (!project || !project.phases || project.phases.length === 0) {
            return;
        }

        const analyzeDelays = async () => {
            setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                // Convert phases to API format
                const phasesData = project.phases.map(phase => ({
                    id: phase.id,
                    name: phase.name,
                    startDate: phase.startDate.toISOString(),
                    endDate: phase.endDate.toISOString(),
                    status: phase.status,
                    dependencies: phase.dependencies || [],
                }));

                const response = await fetch('/api/analyze-delays', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phases: phasesData }),
                });

                if (!response.ok) {
                    throw new Error('Failed to analyze delays');
                }

                const data = await response.json();

                setAnalysis({
                    delayedPhases: data.delayedPhases || [],
                    impactedPhases: data.impactedPhases || [],
                    recommendations: data.recommendations || [],
                    cascadeImpact: data.cascadeImpact || '',
                    isLoading: false,
                    error: null,
                });
            } catch (err: any) {
                setAnalysis(prev => ({
                    ...prev,
                    isLoading: false,
                    error: err.message || 'Failed to analyze delays',
                }));
            }
        };

        analyzeDelays();
    }, [project?.id, project?.phases?.length]); // Re-analyze when project changes

    return analysis;
}
