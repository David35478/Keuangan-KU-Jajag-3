import { GoogleGenAI, Type } from "@google/genai";
import { DataItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMockData = async (topic: string): Promise<Omit<DataItem, 'id' | 'createdAt'>[]> => {
  if (!apiKey) {
    console.warn("API Key is missing. Mock data generation skipped.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of 5 to 10 realistic data entries related to the topic: "${topic}". 
      The 'value' should be a number (e.g., price, quantity, score). 
      The 'name' should be a descriptive label.
      Keep values realistic for the topic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The name or label of the entry"
              },
              value: {
                type: Type.NUMBER,
                description: "The numerical value associated with the entry"
              },
              category: {
                type: Type.STRING,
                description: "A short category tag for this item"
              }
            },
            required: ["name", "value"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Failed to generate data with Gemini:", error);
    throw error;
  }
};
