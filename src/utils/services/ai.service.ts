import { GoogleGenerativeAI } from "@google/generative-ai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { AI_MODELS } from "../constants/ai.constants";

export const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: AI_MODELS.HUGGING_FACE.EMBEDDING_MODEL
});

export const initializeAI = (): GoogleGenerativeAI => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};