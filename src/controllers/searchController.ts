// import { Request, Response } from "express";
// import { searchSchema } from "../schema/searchSchema";
// import { getFinalEmbedding } from "../services/embeddings";
// import { getPineconeIndex } from "../config/pinecone";
// import { contentModel } from "../models/contentModel";
// import { ai } from "../services/embeddings"; // Ensure this is the correct import path for your AI service


// export const search = async (req: Request, res: Response): Promise<void> => {
//   const validation = searchSchema.safeParse(req.body);
//   if (!validation.success) {
//     res.status(400).json({ message: "Search query is required" });
//     return;
//   }

//   const { query } = req.body;
//   const userId = req.userId;

//   try {
//     // Get embedding for the query
//     const queryEmbedding = await getFinalEmbedding(query);
//     const pineconeIndex = getPineconeIndex();

//     // Search in vector database for similar content
//     const searchResponse = await pineconeIndex.query({
//       vector: queryEmbedding || [],
//       topK: 5,
//       includeMetadata: true,
//       filter: {
//         userId: userId?.toString() || "",
//       },
//     });

//     // Extract relevant content from database based on vector search results
//     const contentIds = searchResponse.matches.map((match: any) => match.id);
//     const relevantContent = await contentModel.find({
//       _id: { $in: contentIds },
//       userId: userId,
//     });

//     // Map content to include similarity score
//     const contentWithScores = relevantContent
//       .map((content: any) => {
//         const match = searchResponse.matches.find(
//           (m: any) => m.id === content._id.toString()
//         );
//         return {
//           ...content.toObject(),
//           similarityScore: match ? match.score : 0,
//         };
//       })
//       .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
//       .slice(0, 2);

//     // If no relevant content found
//     if (contentWithScores.length === 0) {
//       res.json({
//         message:
//           "No relevant content found in your second brain for this query.",
//         results: [],
//       });
//       return;
//     }

//     // Build context from relevant content
//     let context =
//       "Below is the relevant information from the user's second brain:\n\n";
//     contentWithScores.forEach((item: any, index: number) => {
//       context += `[Content ${index + 1}]\nTitle: ${item.title}\nType: ${
//         item.type
//       }\n`;
//       if (item.link) context += `Link: ${item.link}\n`;
//       context += `Content: ${item.content}\n\n `;
//     });

//     const prompt = `${context}\n\nUser query: "${query}"\n\nBased on the information above from the user's second brain, please provide a helpful and concise response to their query. If the information doesn't contain a direct answer, try to extract relevant insights that might be helpful. if any is questions asked, try to answer it with your knowledege also.`;
//     const result = await ai.models.generateContent({
//         model: "gemini-1.5-flash",
//         contents: [{ 
//             role: "user", 
//             parts: [{ text: prompt }] 
//         }],
//     });

//     const answer = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

//     res.json({
//       message: "Search results found",
//       relevantContent: contentWithScores,
//       answer: answer,
//     });
//   } catch (error) {
//     console.error("Search error:", error);
//     res.status(500).json({ message: "Error processing search request" });
//   }
// };



import { Request, Response } from "express";
import { searchSchema } from "../schema/searchSchema";
import { getFinalEmbedding } from "../services/embeddings";
import { getPineconeIndex } from "../config/pinecone";
import { contentModel } from "../models/contentModel";
import { ai } from "../services/embeddings"; // Ensure correct import path

export const search = async (req: Request, res: Response): Promise<void> => {
  const validation = searchSchema.safeParse(req.body);
  if (!validation.success) {
    console.log("[DEBUG] Invalid request body:", req.body);
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  const { query } = req.body;
  const userId = req.userId;

  try {
    console.log("[DEBUG] Received search query:", query);
    console.log("[DEBUG] For userId:", userId);

    // Get embedding
    const queryEmbedding = await getFinalEmbedding(query);
    console.log("[DEBUG] Query Embedding:", queryEmbedding?.slice(0, 5), "..."); // Log first 5 values

    const pineconeIndex = getPineconeIndex();

    // Search vector DB
    const searchResponse = await pineconeIndex.query({
      vector: queryEmbedding || [],
      topK: 5,
      includeMetadata: true,
      filter: {
        userId: userId?.toString() || "",
      },
    });

    console.log("[DEBUG] Search Response from Pinecone:", searchResponse);

    const contentIds = searchResponse.matches.map((match: any) => match.id);
    console.log("[DEBUG] Matching Content IDs:", contentIds);

    const relevantContent = await contentModel.find({
      _id: { $in: contentIds },
      userId: userId,
    });

    console.log("[DEBUG] Relevant Content from DB:", relevantContent);

    const contentWithScores = relevantContent
      .map((content: any) => {
        const match = searchResponse.matches.find(
          (m: any) => m.id === content._id.toString()
        );
        return {
          ...content.toObject(),
          similarityScore: match ? match.score : 0,
        };
      })
      .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
      .slice(0, 2);

    console.log("[DEBUG] Top 2 Sorted Relevant Content:", contentWithScores);

    if (contentWithScores.length === 0) {
      console.log("[DEBUG] No matching content found.");
      res.json({
        message:
          "No relevant content found in your second brain for this query.",
        results: [],
      });
      return;
    }

    // Construct context
    let context =
      "Below is the relevant information from the user's second brain:\n\n";
    contentWithScores.forEach((item: any, index: number) => {
      context += `[Content ${index + 1}]\nTitle: ${item.title}\nType: ${
        item.type
      }\n`;
      if (item.link) context += `Link: ${item.link}\n`;
      context += `Content: ${item.content}\n\n `;
    });

    console.log("[DEBUG] Final Prompt Sent to Gemini:\n", context);

    const prompt = `${context}\n\nUser query: "${query}"\n\nBased on the information above from the user's second brain, please provide a helpful and concise response to their query. If the information doesn't contain a direct answer, try to extract relevant insights that might be helpful. if any is questions asked, try to answer it with your knowledege also.`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const answer =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    console.log("[DEBUG] Gemini Answer:", answer);

    res.json({
      message: "Search results found",
      relevantContent: contentWithScores,
      answer: answer,
    });
  } catch (error) {
    console.error("[ERROR] Search failed:", error);
    res.status(500).json({ message: "Error processing search request" });
  }
};
