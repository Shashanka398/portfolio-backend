import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { resumeContextLoader } from "../resumeContextLoader";
import { Document } from "@langchain/core/documents";
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from "dotenv";
import { embeddings } from "../../utils/services/ai.service";
import { CHAT_PROMPTS } from "../../utils/prompts/chat.prompts";
import { PINECONE_CONFIG } from "../../utils/constants/ai.constants";
dotenv.config();



export const documentSpliter = async () => {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: PINECONE_CONFIG.CHUNK_SIZE,
      chunkOverlap: PINECONE_CONFIG.CHUNK_OVERLAP,
    });

    console.log("Loading resume content...");
    const resumeContent = await resumeContextLoader();
    console.log("Resume content loaded:", resumeContent?.length, "pages");
    
    if (!resumeContent?.length) {
        throw new Error("No resume content was loaded");
    }
    
    console.log("First page content sample:", resumeContent[0].pageContent.substring(0, 200));
    
    const combinedContent = resumeContent
      .map((doc) => doc.pageContent)
      .join("\n");
    const resumeDoc = new Document({ pageContent: combinedContent });
    console.log("\n--- Splitting Resume Document ---");
    const resumeChunks = await splitter.splitDocuments([resumeDoc]);
    console.log(`Created ${resumeChunks.length} chunks from resume`);
    
    const blogText =
      "LangChain is a powerful framework for building AI applications. It provides modules for models, prompts, document loaders, and agents, simplifying the development of complex RAG systems.";
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

export const storeInPinconeVector = async () => {
    try {
        const requiredEnvVars = {
            'PINECONE_API_KEY': process.env.PINECONE_API_KEY,
            'PINECONE_INDEX': process.env.PINECONE_INDEX,
            'HUGGINGFACEHUB_API_KEY': process.env.HUGGINGFACEHUB_API_KEY 
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        const { resumeChunks } = await documentSpliter();
        
        if (!resumeChunks?.length) {
            throw new Error("No resume chunks were generated");
        }
        

        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY as string
        });

        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);        
        const vectors = await Promise.all(
            resumeChunks.map(async (chunk, i) => {
                const [embedding] = await embeddings.embedDocuments([chunk.pageContent]);
                const cleanMetadata = {
                    text: chunk.pageContent,
                    pageNumber: chunk.metadata?.pageNumber || 0
                };
                
                return {
                    id: `chunk_${i}`,
                    values: embedding,
                    metadata: cleanMetadata
                };
            })
        );

        await pineconeIndex.upsert(vectors);
        console.log("Documents have been successfully uploaded to Pinecone!");
        const queryEmbedding = await embeddings.embedQuery(CHAT_PROMPTS.RESUME_QUERY);
        console.log("Query embedding generated, searching Pinecone...");
        
        const searchResults = await pineconeIndex.query({
            vector: queryEmbedding,
            topK: 5, // Increased to get more results
            includeMetadata: true,
            includeValues: false
        });
        
        console.log("Raw search results:", JSON.stringify(searchResults, null, 2));

        console.log(`Found ${searchResults.matches?.length || 0} relevant matches`);
        
        // Return the search results
        return searchResults.matches?.map(match => ({
            content: match.metadata?.text,
            score: match.score
        })) || [];

    } catch (error) {
        console.error("Error storing in Pinecone Vector:", error);
        throw error;
    }
}
