import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RESUME_URL } from "../../utils/constants/resume.constants";
export const resumeContextLoader = async () => {
  try {
    const response = await fetch(RESUME_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }    
    const pdfBlob = await response.blob();    
    const loader = new PDFLoader(pdfBlob);
    const docs = await loader.load();
    return docs;

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    throw new Error(`Failed to load resume context: ${error.message}`);
  }
};
