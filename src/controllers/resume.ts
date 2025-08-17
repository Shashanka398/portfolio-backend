import { resumeContextLoader } from '../services/resumeContextLoader';
import { Request, Response } from 'express';

export const getResumeContent = async (req:Request, res:Response) => {
    try {
        const data = await resumeContextLoader();
        res.json({ data });
    } catch(e) {
        console.error("Error loading resume context:", e);
        res.status(500).json({ error: `Failed to load resume context: ${e}` });
    }
}