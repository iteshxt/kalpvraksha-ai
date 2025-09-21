import { VercelRequest, VercelResponse } from '@vercel/node';
import { VoiceModel } from '../lib/voice-model';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, voiceName, systemInstruction } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text input is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        const voiceModel = new VoiceModel({
            apiKey,
            voiceName,
            systemInstruction
        });

        const response = await voiceModel.generateVoiceResponse(text);

        if (!response.success) {
            return res.status(500).json({ error: response.error });
        }

        // Return both audio and text response
        const result: any = {
            success: true,
            textResponse: response.textResponse
        };

        if (response.audioData) {
            // Convert audio buffer to base64 for JSON response
            result.audioData = response.audioData.toString('base64');
            result.audioFormat = 'wav';
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}