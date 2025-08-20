import { Request, Response } from 'express';
import { uploadLinkedInData, uploladResumeToVector } from '../services/upload-contect-vector';

type VectorType = 'RESUME' | 'LINKEDIN';

export const uploadToVectorByType = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                error: "Request body is missing"
            });
        }

        const { type } = req.body;
        if (!type || typeof type !== 'string') {
            return res.status(400).json({
                success: false,
                error: "Type is required and must be a string"
            });
        }
        const normalizedType = type.toUpperCase() as VectorType;
        if (!['RESUME', 'LINKEDIN'].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                error: "Invalid type. Must be either 'RESUME' or 'LINKEDIN'"
            });
        }

        switch(normalizedType){
            case 'RESUME':
                uploladResumeToVector()
                break
            case 'LINKEDIN':
                uploadLinkedInData()
                break
        }
       
        
        return res.status(200).json({
            success: true,
            message: `Successfully uploaded ${normalizedType.toLowerCase()} data to vector`
        });

    } catch (e) {
        console.error("Error uploading to vector:", e);
        return res.status(500).json({
            success: false,
            error: e instanceof Error ? e.message : "An unexpected error occurred"
        });
    }
}