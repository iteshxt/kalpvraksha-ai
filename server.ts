import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VoiceModel } from './lib/voice-model';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
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
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { text, voiceName, systemInstruction } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text input is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        console.log('Processing chat request:', { text: text.substring(0, 50) + '...' });

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
            console.log('Audio response generated, size:', response.audioData.length, 'bytes');
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Process audio endpoint
app.post('/api/process-audio', async (req, res) => {
    try {
        const { audioData, format = 'wav' } = req.body;

        if (!audioData) {
            return res.status(400).json({ error: 'Audio data is required' });
        }

        console.log('Processing audio request:', { format, dataLength: audioData.length });

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
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Kalpvraksha AI Voice API',
        version: '1.0.0',
        endpoints: ['/api/health', '/api/chat', '/api/process-audio'],
        documentation: 'See /api/health for endpoint details'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Kalpvraksha AI Voice API Server started');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🎵 Audio endpoint: http://localhost:${PORT}/api/process-audio`);
    console.log('');

    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  WARNING: GEMINI_API_KEY not found in environment variables');
        console.log('   Please set your API key in .env file');
    } else {
        console.log('✅ GEMINI_API_KEY configured');
    }
});

export default app;