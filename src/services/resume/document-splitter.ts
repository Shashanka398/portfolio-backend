import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from "dotenv";
import { embeddings } from "../../utils/services/ai.service";
import { CHAT_PROMPTS } from "../../utils/prompts/chat.prompts";
import { PINECONE_CONFIG } from "../../utils/constants/ai.constants";
import { resumeContextLoader } from "./resumeContextLoader";
dotenv.config();



export const documentSpliter = async () => {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: PINECONE_CONFIG.CHUNK_SIZE,
      chunkOverlap: PINECONE_CONFIG.CHUNK_OVERLAP,
    });
    const resumeContent = await resumeContextLoader();    
    if (!resumeContent?.length) {
        throw new Error("No resume content was loaded");
    }

    const combinedContent = resumeContent
      .map((doc) => doc.pageContent)
      .join("\n");
    const resumeDoc = new Document({ pageContent: combinedContent });
    const resumeChunks = await splitter.splitDocuments([resumeDoc]);
    
    const blogText =CHAT_PROMPTS.DOCUMENT_SPLITTER_LC_PROMT
    const blogDoc = new Document({ pageContent: blogText });
    const blogChunks = await splitter.splitDocuments([blogDoc]);
    return { resumeChunks, blogChunks };
    
  } catch (e: unknown) {
    throw new Error(
      `Failed to split document: ${e instanceof Error ? e.message : String(e)}`
    );
  }
};

export const searchResume = async (q: any) => {

    try {
        const query= q.query;
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY as string
        });
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);
        
        const queryEmbedding = await embeddings.embedQuery(query);
        
        const searchResults = await pineconeIndex.query({
            vector: queryEmbedding,
            topK: PINECONE_CONFIG.TOP_K,
            includeMetadata: true,
        });

        console.log("Search results",searchResults)

        return searchResults.matches?.map(match => ({
            content: match.metadata?.text,
            score: match.score,
            relevance: match.score ? Math.round(match.score * 100) + "% relevant" : "Unknown relevance"
        })) || [];

    } catch (error) {
        console.error("Error searching resume:", error);
        throw error;
    }
};

