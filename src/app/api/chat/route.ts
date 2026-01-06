import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function POST(req: Request) {
    try {
        const { message, projectContext } = await req.json();

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Construct System Prompt with Context
        let systemPrompt = `You are "RealField Expert", a specialized AI assistant for construction management in Israel.
        
ROLE & TONE:
- You are a senior construction engineer: professional, concise, safety-obsessed, and knowledgeable about Israeli standards.
- Speak primarily in Hebrew (unless asked in English), but use professional English terms where appropriate (e.g., "Gantt", "Critical Path").
- Your tone is "Daytime Basalt": architectural, sharp, and helpful.`;

        // Inject Project Context if available
        if (projectContext) {
            systemPrompt += `\n\nACTIVE PROJECT CONTEXT:
You are currently viewing the project "${projectContext.name}".
Client: ${projectContext.client}
Location: ${projectContext.address}
Status: ${projectContext.status}

Budget Overview:
${JSON.stringify(projectContext.budget, null, 2)}

Phase Timeline:
${JSON.stringify(projectContext.phases, null, 2)}

INSTRUCTIONS:
- Use this data to answer specific questions about the project.
- If a phase is late (EndDate < Today), point it out as a risk.
- If over budget, mention specific segments.
- Cite specific dates and amounts from the data provided.`;
        } else {
            systemPrompt += `\n\nNO SPECIFIC PROJECT SELECTED. Answer general construction questions.`;
        }

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am RealField Expert, ready to assist with construction management specific to this project context.' }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request with Gemini' },
            { status: 500 }
        );
    }
}
