import { GoogleGenAI, Type } from "@google/genai";

export interface FormalComplaint {
  formalLetter: string;
  category: string;
  authority: string;
  authorityEmail: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: string; // e.g. "Angry", "Frustrated", "Neutral"
  sentimentEmoji: string;
}

export async function processComplaint(rawText: string): Promise<FormalComplaint> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in the AI Studio Secrets panel.");
  }
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an AI assistant for a student grievance system called GrievanceGPT.
    Your task is to take a raw, informal student complaint and:
    1. Rewrite it into a professional, formal complaint letter.
    2. Classify it into one of these categories: Academic, Hostel, Harassment, Facilities, Financial, Ragging, Other.
    3. Assign a priority (Low, Medium, High, Critical) based on the urgency and severity.
    4. Identify the most appropriate authority (HOD, Principal, Warden, Admin, Anti-Ragging Cell).
    5. Detect the sentiment of the student (e.g., Frustrated, Urgent, Concerned, Neutral).
    6. Provide a sentiment emoji.
    7. Provide a realistic placeholder email for that authority.
    8. Create a concise subject line.

    Student Complaint: "${rawText}"
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formalLetter: { type: Type.STRING },
            category: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            authority: { type: Type.STRING },
            authorityEmail: { type: Type.STRING },
            subject: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            sentimentEmoji: { type: Type.STRING },
          },
          required: ["formalLetter", "category", "priority", "authority", "authorityEmail", "subject", "sentiment", "sentimentEmoji"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini AI.");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to process complaint with AI: ${error instanceof Error ? error.message : String(error)}`);
  }
}
