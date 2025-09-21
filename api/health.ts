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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const timestamp = new Date().toISOString();
        const apiKeyConfigured = !!process.env.GEMINI_API_KEY;

        return res.status(200).json({
            status: 'healthy',
            timestamp,
            service: 'Kalpvraksha AI Voice API',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            configuration: {
                geminiApiKey: apiKeyConfigured ? 'configured' : 'missing'
            },
            endpoints: [
                {
                    path: '/api/health',
                    method: 'GET',
                    description: 'Health check endpoint'
                },
                {
                    path: '/api/chat',
                    method: 'POST',
                    description: 'Text to voice conversion',
                    requiredFields: ['text'],
                    optionalFields: ['voiceName', 'systemInstruction']
                },
                {
                    path: '/api/process-audio',
                    method: 'POST',
                    description: 'Audio processing endpoint',
                    requiredFields: ['audioData'],
                    optionalFields: ['format']
                }
            ]
        });

    } catch (error) {
        console.error('Health check error:', error);
        return res.status(500).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}