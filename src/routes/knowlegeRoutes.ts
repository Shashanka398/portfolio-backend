import { Router } from "express";
import { Request, Response } from "express";
import { documentSpliter, storeInPinconeVector, searchResume } from "../services/helper/document-splitter";
import { getResumeContent } from "../controllers/resume";
import { handleChatQuery } from "../controllers";

const router = Router();

router.get("/resumeContent", async (req: Request, res: Response) => {
    try {
        const relevantDocs = await storeInPinconeVector();
        res.json({ success: true, data: relevantDocs });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : "An unexpected error occurred" 
        });
    }
});

router.get("/resumeDetails", getResumeContent);

router.get("/chat", handleChatQuery);

export default router;