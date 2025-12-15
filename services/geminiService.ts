import { GoogleGenAI, Type } from "@google/genai";
import { DataItem } from "../types";

const apiKey = 'AIzaSyBJ-8wPge6bO5N6WgZs-6K9KrfErTUGAA0';
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
      The content MUST be in Indonesian (Bahasa Indonesia).
      The 'value' should be a number in Rupiah (IDR) scale (e.g. 50000, 1000000), but do not include formatting symbols in the JSON number.
      The 'name' should be a descriptive label in Indonesian.
      The 'category' should be one of: 'Umum', 'Keuangan', 'Inventaris', 'Penjualan'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The name or label of the entry in Indonesian"
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