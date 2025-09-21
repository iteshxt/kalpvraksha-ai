# API Testing Guide

I've created comprehensive testing tools for your Kalpvraksha AI Voice API. Here's how to use them:

## 🚀 Getting Started

1. **Start your server:**

   ```bash
   npm run dev
   ```

   Your server should be running at `http://localhost:3000`

2. **Choose your testing method:**
   - **Web Interface (Recommended)**: `test-web.html`
   - **Command Line**: `test-api.js`

## 🌐 Web Interface Testing (test-web.html)

**The easiest way to test your API!**

1. Open `test-web.html` in your browser
2. The page will automatically check if your server is running
3. Use the interactive interface to test all endpoints

### Features

- ✅ **Health Check**: Real-time API status monitoring
- 💬 **Chat Testing**: Send messages and get voice responses
- 🎵 **Audio Processing**: Test audio upload functionality
- ⚠️ **Error Testing**: Verify error handling works correctly
- 🎧 **Audio Playback**: Listen to generated voice responses directly in browser
- 💾 **Audio Download**: Save generated audio files

### Quick Tests

- Click "Quick Test" buttons for pre-written wellness messages
- Upload your own audio files to test processing
- Test error scenarios with dedicated buttons

## 🖥️ Command Line Testing (test-api.js)

**For developers who prefer terminal testing:**

```bash
npm run test
```

### What it tests

- ✅ Health endpoint functionality
- 💬 Multiple chat scenarios with voice generation
- 🎵 Audio processing with dummy data
- ⚠️ Error handling for various scenarios
- 📁 Saves generated audio files as `test_audio_1.wav`, `test_audio_2.wav`, etc.

## 🎯 What Each Test Does

### Health Check (`/api/health`)

- Verifies server is running
- Checks API key configuration
- Lists available endpoints

### Chat Endpoint (`/api/chat`)

- Sends text messages to AI
- Generates voice responses
- Tests different voice settings
- Returns both text and audio responses

### Audio Processing (`/api/process-audio`)

- Tests audio data handling
- Verifies format support
- Simulates mobile app audio uploads

### Error Handling

- Tests missing required parameters
- Verifies proper error responses
- Checks HTTP status codes

## 🎵 Audio Output

Both testing methods will generate audio files:

- **Web Interface**: Listen directly in browser + download option
- **Command Line**: Saves as `.wav` files in your project directory

You can play these audio files to verify the voice quality and content.

## 🔧 Troubleshooting

### Server Not Responding

- Make sure you run `npm run dev` first
- Check that port 3000 is not being used by another application
- Verify your `.env` file has the correct `GEMINI_API_KEY`

### Audio Issues

- Generated audio is in WAV format
- Check your browser's audio permissions
- For command line testing, use any audio player to play the `.wav` files

### API Key Issues

- Verify your Gemini API key is valid
- Check the health endpoint shows "API Key: configured"
- Make sure your `.env` file is in the project root

## 📱 Mobile App Integration Testing

The web interface mimics how your mobile app will interact with the API:

1. **Text Input**: Test sending messages like your app would
2. **Audio Response**: Verify the base64 audio data can be played
3. **Error Handling**: Ensure your app can handle API errors gracefully

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Health check shows "healthy" status
- ✅ Chat messages return both text and audio responses
- ✅ Audio files play Dr. Swatantra AI's voice
- ✅ Error tests return proper 400/404 status codes

Happy testing! 🚀
