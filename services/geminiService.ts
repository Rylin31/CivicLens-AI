import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const SYSTEM_INSTRUCTION = `You are CivicLens, an AI-powered news and policy summarizer designed to deliver concise, factual, and balanced insights. Your purpose is to help readers quickly understand complex news stories or government policies without misinformation or bias.

You will receive a news article or policy text as input. Analyze it carefully and produce a structured response.

Guidelines:
- Stay completely neutral; never insert personal opinions or political bias.
- Use short, factual sentences.
- If the input lacks context, politely state that in the summary.
- The summary must be between 80 and 120 words.
- Pros and Cons lists should contain 3 to 5 items each.
- The Citizen Impact Summary must be 2-3 lines.
- Do not add any introductory or concluding text outside of the required JSON structure.
- Always adhere to the provided JSON schema.
`;

const RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING, description: "A neutral, informative headline that summarizes the main event or policy." },
        summary: { type: Type.STRING, description: "A clear, objective summary (80–120 words) answering what, who, and why it matters." },
        pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3–5 positive implications or benefits, based on facts."
        },
        cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3–5 drawbacks, risks, or controversies."
        },
        toneAnalysis: {
            type: Type.OBJECT,
            properties: {
                tone: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral", "Mixed"] },
                reason: { type: Type.STRING, description: "A brief explanation for the tone classification." }
            },
            required: ["tone", "reason"]
        },
        keyStakeholders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of groups or entities directly affected or involved."
        },
        citizenImpactSummary: { type: Type.STRING, description: "A 2–3 line explanation of how this could affect everyday people." }
    },
    required: ["headline", "summary", "pros", "cons", "toneAnalysis", "keyStakeholders", "citizenImpactSummary"]
};

/**
 * Helper function to extract the main article text from an HTML document.
 * It removes common non-content elements and targets typical article containers.
 */
const extractMainContent = (doc: Document): string => {
    // Remove elements that are typically not part of the main content
    doc.querySelectorAll('script, style, link, nav, header, footer, aside, .ad, .advert, .sidebar, .ad-banner').forEach(el => el.remove());

    const mainSelectors = ['article', 'main', '[role="main"]', '.post-content', '.article-body', '#content', '#main', '.story-content'];
    let mainContentElement: HTMLElement | null = null;
    for (const selector of mainSelectors) {
        mainContentElement = doc.querySelector(selector);
        if (mainContentElement) break;
    }

    // Fallback to the body if no specific container is found
    if (!mainContentElement) {
        mainContentElement = doc.body;
    }

    // Use innerText to get visually rendered text and clean up whitespace
    let text = mainContentElement.innerText || mainContentElement.textContent || '';
    return text.replace(/\s{2,}/g, '\n\n').trim(); // Collapse multiple whitespace chars into paragraphs
};

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};

export const analyzeUrl = async (url: string): Promise<AnalysisResult> => {
  try {
    // In a production app, this fetching would happen on a backend server to avoid CORS issues.
    // For this client-side demo, we use a public CORS proxy.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const articleText = extractMainContent(doc);

    if (!articleText || articleText.length < 250) { // Check for a reasonable minimum content length
        throw new Error("Couldn’t fetch content. Please check the URL.");
    }

    // Once text is extracted, use the existing analysis function
    return await analyzeText(articleText);

  } catch (error) {
    console.error("Error in analyzeUrl:", error);
    if (error instanceof Error && error.message.includes("fetch content")) {
        throw error;
    }
    throw new Error("Couldn’t fetch content. Please check the URL.");
  }
};
