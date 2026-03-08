'use server';

import { getOrgIntel as fallbackOrgIntel } from '@/lib/scoring';
import { GoogleGenAI } from '@google/genai';

// We initialize the client inside the function so it doesn't crash on build if key is missing
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export async function getRealOrgIntel(orgName, industry, role) {
    try {
        const ai = getGeminiClient();
        if (!ai) {
            console.warn("No GEMINI_API_KEY found. Falling back to rules engine.");
            return fallbackOrgIntel(orgName);
        }

        const prompt = `
You are the AI engine for a brutal, dark-humor web app that calculates a user's "AI Replaceability Score".
The user works at an organization called "${orgName}" in the "${industry}" industry as a "${role}".

Task: Act as a ruthless AI data analyst. Research this specific organization ("${orgName}").
1. Determine how aggressively this specific company or industry is adopting AI/Automation, firing people, or automating roles.
2. Generate a "mod" (multiplier) between 0.80 and 1.35 based on their risk.
   - 1.35 = They literally build AI or are famous for firing people to use AI (e.g. Google, OpenAI, IBM)
   - 1.15 = High adoption, tech-forward, automating aggressively
   - 1.00 = Average company
   - 0.80 = Government, unions, extremely slow to adopt technology
3. Write a "note" (max 2 short sentences). The note MUST BE brutally honest, dark humor, and specific to the company's actual known behavior with AI or tech if possible. If the company is obscure, focus on the industry. DO NOT use hashtags.

Return ONLY a valid JSON object matching this exact format:
{
  "mod": 1.15,
  "note": "Their CEO just announced a $2B investment in AI. Your department is definitely paying for it."
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        const text = response.text;
        const data = JSON.parse(text);

        // Map the mod to a tier
        let tier = "moderate";
        if (data.mod >= 1.2) tier = "extreme";
        else if (data.mod >= 1.1) tier = "very_high";
        else if (data.mod >= 1.05) tier = "high";
        else if (data.mod < 0.9) tier = "low";

        return {
            mod: data.mod || 1.0,
            tier: tier,
            note: data.note || fallbackOrgIntel(orgName).note,
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback to our hardcoded database/keyword logic if the API fails, times out, or hallucinates
        return fallbackOrgIntel(orgName);
    }
}
