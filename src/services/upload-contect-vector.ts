import { LINKEDIN_JSON } from "../constants/linkedIn-json.constants";
import { storeDocuments } from "./pinecone.service";
import { documentSpliter } from "./resume/document-splitter";

export const uploladResumeToVector=async()=>{
    try{
        const {resumeChunks}=await documentSpliter()
        const pineconeDocuments = resumeChunks.map(chunk => ({
            content: chunk.pageContent,
            metadata: chunk.metadata
        }));
        await storeDocuments(pineconeDocuments)
        return true
    }catch(e){
    
    }
}


export const  uploadLinkedInData=async()=>{
    try{
        console.log("Entered to linkedin")
        const linkedInDocuments = Object.entries(LINKEDIN_JSON).map(([key, value]) => ({
            content: JSON.stringify(value),
            metadata: { key }
        }));
        await storeDocuments(linkedInDocuments)
    }catch(e){

    }
}