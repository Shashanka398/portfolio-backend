import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const AI_MODELS = {
    GEMINI: {
        DEFAULT: "gemini-2.0-flash-lite",
        FLASH_LITE: "gemini-2.0-flash-lite"
    },
    HUGGING_FACE: {
        EMBEDDING_MODEL: "BAAI/bge-large-en-v1.5"
    }
};

export const SAFETY_SETTINGS = {
    DEFAULT: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
    ]
};

export const GENERATION_CONFIG = {
    DEFAULT: {
        temperature: 0.7
    }
};

export const PINECONE_CONFIG = {
    CHUNK_SIZE: 1512,
    CHUNK_OVERLAP: 150,
    TOP_K: 10,
    DEFAULT_SEARCH_CONFIG: {
        includeMetadata: true,
        includeValues: false
    }
};