import { Pinecone } from "@pinecone-database/pinecone";
import { embeddings, initializeAI } from "../utils/services/ai.service";
import { CHAT_PROMPTS } from "../utils/prompts/chat.prompts";
import { GEMINI_AI_CONFIG } from "../utils/config/ai.config";
import { initializePinecone } from "../utils/embedings/ai.utils";

interface ChatResponse {
  answer: any;
  context?: any[];
}

const validateEnvironmentVariables = (): void => {
  if (
    !process.env.PINECONE_API_KEY ||
    !process.env.PINECONE_INDEX ||
    !process.env.GEMINI_API_KEY
  ) {
    throw new Error(
      "Missing required environment variables: PINECONE_API_KEY, PINECONE_INDEX, or GEMINI_API_KEY"
    );
  }
};





export const processQuery = async (query: string): Promise<ChatResponse> => {
  validateEnvironmentVariables();
  const queryEmbedding = await embeddings.embedQuery(query);
  if (!Array.isArray(queryEmbedding)) {
    throw new Error("Invalid embedding format received");
  }
  const pinecone = initializePinecone();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);
  const searchResults = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: 10,
    includeMetadata: true,
  });

  const context = searchResults.matches
    .map((match) => match.metadata?.text || "")
    .filter((text) => text.toString().length > 0)
    .join("\n\n");

  if (!context) {
    return {
      answer:
        "I couldn't find any relevant context to answer your question. Could you please rephrase or ask a different question?",
      context: [],
    };
  }
  const ai = initializeAI();
  const prompt = CHAT_PROMPTS.PERSONAL_RESPONSE(context, query);
  const model = ai.getGenerativeModel(GEMINI_AI_CONFIG);
  const response = await model.generateContent(prompt);
  if (!response) {
    throw new Error("Failed to generate response from AI");
  }

  const result = await response.response;
  const text = result.text();

  return {
    answer: text,
    context: searchResults.matches,
  };
};
