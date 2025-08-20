import { Router } from "express";
import { Request, Response } from "express";
import { getResumeContent } from "../controllers/resume";
import { handleChatQuery } from "../controllers";
import { uploadToVectorByType } from "../controllers/uploadToVector.controller";

const router = Router();

// router.get("/resumeContent", async (req: Request, res: Response) => {
//     try {
//         const relevantDocs = await storeInPinconeVector();
//         res.json({ success: true, data: relevantDocs });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             error: error instanceof Error ? error.message : "An unexpected error occurred" 
//         });
//     }
// });


router.post("/upload-to-vector",uploadToVectorByType)

router.get("/resumeDetails", getResumeContent);

router.get("/chat", handleChatQuery);

export default router;