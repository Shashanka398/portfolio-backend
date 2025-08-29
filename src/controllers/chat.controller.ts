import { Request, Response } from 'express';
import { processQuery } from '../services/chat.service';

/**
 * Handle chat query request
 * @param req Express request object containing query parameter
 * @param res Express response object
 */
export const handleChatQuery = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body;
        
        if (!message || typeof message !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Invalid query parameter',
                message: 'Query must be a non-empty string'
            });
            return;
        }

        const response = await processQuery(message);
        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error in chat controller:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'An error occurred while processing your request'
        });
    }
};