import { Pinecone } from '@pinecone-database/pinecone';
import { embeddings } from "../utils/services/ai.service";
import dotenv from "dotenv"
dotenv.config();
interface PineconeMetadata {
    [key: string]: any;
}

interface PineconeDocument<T extends PineconeMetadata> {
    content: string;
    metadata?: T;
}

interface SearchConfig {
    topK?: number;
    filter?: Record<string, unknown>;
    namespace?: string;
}

interface SearchResult<T extends PineconeMetadata> {
    content: string;
    metadata: T;
    score: number;
}

const getPineconeClient = () => {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
        throw new Error('PINECONE_API_KEY environment variable is required');
    }
    return new Pinecone({ apiKey });
};

interface StoreDocumentsResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export const storeDocuments = async <T extends PineconeMetadata>(
    documents: PineconeDocument<T>[],
): Promise<StoreDocumentsResponse> => {
    try {
        if (!documents.length) {
            return {
                success: false,
                error: "No documents provided to store"
            };
        }
        const pineconeIndex = process.env.PINECONE_INDEX;
        if (!pineconeIndex) {
            return {
                success: false,
                error: "PINECONE_INDEX environment variable is not set"
            };
        }

        const pinecone = getPineconeClient();
        const index = pinecone.Index(pineconeIndex);
        const vectors = await Promise.all(
            documents.map(async (doc, i) => {
                const [embedding] = await embeddings.embedDocuments([doc.content]);
                const cleanMetadata = {
                    text: doc.content,
                    ...(doc.metadata && typeof doc.metadata === 'object' 
                        ? Object.entries(doc.metadata).reduce((acc, [key, value]) => {
                            // Only include primitive values and string arrays
                            if (
                                typeof value === 'string' ||
                                typeof value === 'number' ||
                                typeof value === 'boolean' ||
                                (Array.isArray(value) && value.every(item => typeof item === 'string'))
                            ) {
                                acc[key] = value;
                            }
                            return acc;
                        }, {} as Record<string, string | number | boolean | string[]>)
                        : {})
                };

                return {
                    id: `doc_${i}`,
                    values: embedding,
                    metadata: cleanMetadata
                };
            })
        );

        await index.upsert(vectors);
        
        return {
            success: true,
            message: `Successfully stored ${vectors.length} documents in Pinecone`
        };
    } catch (error) {
        console.error("Error storing documents in Pinecone:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('PineconeBadRequestError')) {
                return {
                    success: false,
                    error: 'Invalid data format for Pinecone storage. Please check your document structure.'
                };
            }
            if (error.message.includes('PINECONE_API_KEY')) {
                return {
                    success: false,
                    error: 'Pinecone API key is missing or invalid'
                };
            }
            return {
                success: false,
                error: error.message
            };
        }
        
        return {
            success: false,
            error: 'An unexpected error occurred while storing documents'
        };
    }
};

