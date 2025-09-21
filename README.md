# Kalpvraksha AI Voice API

A voice AI API for mobile applications, powered by Google's Gemini AI with voice capabilities.

## Features

- **Text-to-Speech**: Convert text input to natural-sounding audio responses
- **Audio Processing**: Handle audio input from mobile applications
- **Health Monitoring**: Built-in health check endpoint
- **CORS Support**: Ready for mobile app integration
- **Vercel Deployment**: Optimized for serverless deployment

## API Endpoints

### POST `/api/chat`

Convert text to voice response using AI.

**Request Body:**

```json
{
  "text": "Hello, how are you?",
  "voiceName": "Sadaltager", // optional
  "systemInstruction": "custom instruction" // optional
}
```

**Response:**

```json
{
  "success": true,
  "textResponse": "AI response text",
  "audioData": "base64-encoded-wav-audio",
  "audioFormat": "wav"
}
```

### POST `/api/process-audio`

Process audio input from mobile applications.

**Request Body:**

```json
{
  "audioData": "base64-encoded-audio-data",
  "format": "wav" // optional
}
```

### GET `/api/health`

Health check endpoint with service status and configuration info.

## Deployment to Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Node.js**: Version 18.x or higher

### Step-by-Step Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Set Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

#### 5. Deploy to Vercel

```bash
vercel
```

Follow the prompts:

- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (for new deployment)
- Project name? Use default or custom name
- Directory? Use default `.`

#### 6. Add Environment Variables to Vercel

```bash
vercel env add GEMINI_API_KEY production
```

Enter your Gemini API key when prompted.

#### 7. Redeploy with Environment Variables

```bash
vercel --prod
```

### Alternative: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key

3. **Deploy**:
   - Vercel will automatically deploy on push to main branch

## Mobile App Integration

### Example Usage (React Native/Flutter)

```javascript
// Text to speech
const response = await fetch('https://your-api.vercel.app/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, I need some wellness advice.'
  })
});

const data = await response.json();

if (data.success && data.audioData) {
  // Convert base64 to audio and play
  const audioBuffer = Buffer.from(data.audioData, 'base64');
  // Play audio using your mobile platform's audio player
}
```

### Health Check

```javascript
const health = await fetch('https://your-api.vercel.app/api/health');
const status = await health.json();
console.log('API Status:', status.status);
```

## Configuration

### Voice Configuration

Available voice names (in `systemInstruction`):

- `Sadaltager` (default)
- Other Gemini-supported voices

### System Instructions

Customize the AI personality by providing a `systemInstruction` parameter with your desired persona configuration.

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify your Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Ensure the key is properly set in Vercel environment variables

2. **CORS Issues**:
   - The API includes CORS headers for mobile app access
   - Check that your mobile app's domain is properly configured

3. **Timeout Issues**:
   - Vercel functions have a 30-second timeout limit
   - For longer audio processing, consider chunking requests

4. **Audio Playback Issues**:
   - Audio is returned as base64-encoded WAV format
   - Ensure your mobile app can decode and play WAV audio

### Getting Help

Check the health endpoint (`/api/health`) for configuration status and available endpoints.

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run locally with Vercel dev server
vercel dev
```

The API will be available at `http://localhost:3000`

### Project Structure

```
├── api/
│   ├── chat.ts          # Main voice chat endpoint
│   ├── process-audio.ts # Audio processing
│   └── health.ts        # Health check
├── lib/
│   └── voice-model.ts   # Core voice AI logic
├── package.json
├── vercel.json          # Vercel configuration
├── tsconfig.json        # TypeScript configuration
└── .env.example         # Environment variables template
```
