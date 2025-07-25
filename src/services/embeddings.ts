import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Promise<number[] | null>
export async function getFinalEmbedding(text: string): Promise<number[] | null> {
  let contentToEmbed = text;

  // Step 1: Summarize (Optional)
  try {
    const summaryRes = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Summarize the following content:\n\n${text}` }],
        },
      ],
    });

    const summary = summaryRes?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (summary) {
      // console.log("Summary:", summary);
      contentToEmbed = summary;
    } else {
      console.warn("No summary returned, using original text.");
    }
  } catch (summaryErr) {
    console.error("Error summarizing text:", summaryErr);
    console.warn("Falling back to original text for embedding.");
  }

  // Step 2: Generate Embedding
  try {
    const embedRes = await ai.models.embedContent({
      model: "embedding-001",
      contents: contentToEmbed,
    });

    const embedding = embedRes?.embeddings?.[0]?.values;

    if (embedding && Array.isArray(embedding)) {
      console.log("Embedding generated:", embedding);
      return embedding;
    } else {
      console.warn("No embedding returned.");
      return null;
    }
  } catch (embedErr) {
    console.error("Error generating embedding:", embedErr);
    return null;
  }
}

// Example usage
// const text = `It was 7 minutes after midnight. The dog was lying on the grass in the middle of the lawn in front of Mrs Shears’ house...`;

// getFinalEmbedding(text);
