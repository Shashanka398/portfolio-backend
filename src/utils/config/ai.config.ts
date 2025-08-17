import { AI_MODELS, SAFETY_SETTINGS, GENERATION_CONFIG } from '../constants/ai.constants';

export const GEMINI_AI_CONFIG = {
    model: AI_MODELS.GEMINI.DEFAULT,
    safetySettings: SAFETY_SETTINGS.DEFAULT,
    generationConfig: GENERATION_CONFIG.DEFAULT
};

export const GEMINI_FLASH_CONFIG = {
    model: AI_MODELS.GEMINI.FLASH_LITE,
    safetySettings: SAFETY_SETTINGS.DEFAULT,
    generationConfig: GENERATION_CONFIG.DEFAULT
};