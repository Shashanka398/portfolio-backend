import { Request, Response } from 'express';
import { resumeContextLoader } from '../services/resume/resumeContextLoader';

export const getResumeContent = async (req:Request, res:Response) => {
    try {
        const docs = await resumeContextLoader();
        if (!docs || docs.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No resume content found'
            });
        }
        
        res.json({
            success: true,
            data: docs
        });
    } catch(e) {
        console.error("Error loading resume context:", e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
        res.status(500).json({
            success: false,
            error: `Failed to load resume context: ${errorMessage}`
        });
    }
}