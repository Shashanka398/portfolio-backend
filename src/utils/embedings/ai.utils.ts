import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Pinecone } from "@pinecone-database/pinecone";

export const embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HUGGINGFACEHUB_API_KEY,
            model: "BAAI/bge-large-en-v1.5", 
        });;

export const initializeAI = (): GoogleGenerativeAI => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
};


export const GEMINI_AI_CONFIG ={
    model: "gemini-2.0-flash-lite",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    generationConfig: {
      temperature: 0.7,
    },
  };


  export const initializePinecone = (): Pinecone => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY as string,
  });
};
