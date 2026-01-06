import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini inside handler to support key switching gracefully
// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface Phase {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    dependencies?: string[];
}

interface DelayAnalysisRequest {
    phases: Phase[];
}

interface ImpactedPhase {
    phaseId: string;
    phaseName: string;
    riskLevel: 'high' | 'medium' | 'low';
    estimatedDelay: number; // days
    reason: string;
}

interface DelayAnalysisResponse {
    delayedPhases: string[];
    impactedPhases: ImpactedPhase[];
    recommendations: string[];
    cascadeImpact: string;
}

export async function POST(request: NextRequest) {
    try {
        const { phases }: DelayAnalysisRequest = await request.json();

        if (!phases || !Array.isArray(phases)) {
            return NextResponse.json(
                { error: 'Phases array is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Identify delayed phases
        const now = new Date();
        const delayedPhases = phases.filter(phase => {
            const endDate = new Date(phase.endDate);
            return phase.status !== 'Completed' && endDate < now;
        });

        if (delayedPhases.length === 0) {
            return NextResponse.json({
                delayedPhases: [],
                impactedPhases: [],
                recommendations: ['All phases are on schedule! Great work! 🎉'],
                cascadeImpact: 'No delays detected. Project timeline is healthy.',
            });
        }

        // Build AI prompt for dependency analysis
        const prompt = `You are a construction scheduling expert specializing in Israeli construction projects.

Analyze the following project phases and identify dependency impacts:

PHASES:
${phases.map(p => `- ${p.name} (ID: ${p.id})
  Status: ${p.status}
  End Date: ${p.endDate}
  Dependencies: ${p.dependencies?.length ? p.dependencies.join(', ') : 'None'}
`).join('\n')}

DELAYED PHASES:
${delayedPhases.map(p => {
            const endDate = new Date(p.endDate);
            const delayDays = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
            return `- ${p.name}: ${delayDays} days delayed`;
        }).join('\n')}

Based on typical Israeli construction sequencing (Foundation → Skeleton → Plumbing/Electrical → Finishes):

1. Identify which phases are DIRECTLY IMPACTED by the delayed phases (consider both explicit dependencies and construction logic)
2. Assess risk level (high/medium/low) for each impacted phase
3. Estimate delay propagation in days
4. Provide 3 specific, actionable mitigation strategies
5. Reference Israeli standards (תקן ישראלי) where applicable

Return ONLY valid JSON in this exact format:
{
  "impactedPhases": [
    {
      "phaseId": "phase_id",
      "phaseName": "Phase Name",
      "riskLevel": "high",
      "estimatedDelay": 5,
      "reason": "Explanation of why this phase is impacted"
    }
  ],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "cascadeImpact": "Brief summary of overall project impact"
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (remove markdown code blocks if present)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const analysis = JSON.parse(jsonText);

        return NextResponse.json({
            delayedPhases: delayedPhases.map(p => p.id),
            impactedPhases: analysis.impactedPhases || [],
            recommendations: analysis.recommendations || [],
            cascadeImpact: analysis.cascadeImpact || '',
        });

    } catch (error: any) {
        console.error('Delay Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze delays' },
            { status: 500 }
        );
    }
}
