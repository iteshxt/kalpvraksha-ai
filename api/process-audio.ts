import { VercelRequest, VercelResponse } from '@vercel/node';

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
        const { audioData, format = 'wav' } = req.body;

        if (!audioData) {
            return res.status(400).json({ error: 'Audio data is required' });
        }

        // For now, this endpoint acknowledges receipt of audio
        // In a full implementation, you would process the audio with speech-to-text
        // then send it through the voice model for a response

        return res.status(200).json({
            success: true,
            message: 'Audio received successfully',
            receivedFormat: format,
            dataLength: audioData.length,
            // In production, you'd process the audio and return a voice response
            note: 'Audio processing endpoint - implementation depends on your speech-to-text service'
        });

    } catch (error) {
        console.error('Audio processing error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}