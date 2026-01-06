import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
// using factory inside handler to handle keys gracefully
// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: Request) {
    try {
        const { message, image, projectContext } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        // Re-initialize with the found key (outside or inside handler, but inside ensures we catch env changes if needed, though usually static)
        // Ideally we initialize outside but for checking different keys we might need to be dynamic or just pick one.
        // Let's stick to the global init but update it if needed.
        // Actually, simple fix: use the key in the check.

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        // Create instance here to ensure we use the valid key
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Construct System Prompt with Context
        let systemPrompt = `You are "RealField Expert", a specialized AI assistant for construction management in Israel.
        
ROLE & TONE:
- You are a senior construction engineer: professional, concise, safety-obsessed, and knowledgeable about Israeli standards.
- Speak primarily in Hebrew (unless asked in English).
- Your tone is "Daytime Basalt": architectural, sharp, and helpful.

SAFESITE VISION (IMAGE ANALYSIS):
If an image is provided:
1. Analyze it for Safety Hazards (PPE, rails, scaffolding, ladders).
2. Check for Quality Issues (concrete segregation, rebar placement).
3. If you see a hazard, start with "⚠️ SAKANA!" (Danger) and cite the relevant Israeli Standard (e.g., Tikn 1142 for safety).`;

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
                    parts: [{ text: 'Understood. I am RealField Expert, ready to assist with construction management specific to this project context and analyze site photos for safety.' }],
                },
            ],
        });

        // Prepare message parts
        let messageParts: any[] = [{ text: message }];

        // Add image part if exists
        if (image) {
            // image is base64 string like "data:image/jpeg;base64,..."
            // we need to remove the prefix
            const base64Data = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];

            if (base64Data) {
                messageParts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            }
        }

        const result = await chat.sendMessage(messageParts);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process request with Gemini' },
            { status: 500 }
        );
    }
}
