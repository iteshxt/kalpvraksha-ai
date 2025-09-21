#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kalpvraksha-ai-8dl6.vercel.app';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

async function testHealthEndpoint() {
    log('\n🩺 Testing Health Endpoint', 'cyan');
    log('=' .repeat(50), 'cyan');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/health`);
        log('✅ Health check successful', 'green');
        log('Status: ' + response.data.status, 'green');
        log('Timestamp: ' + response.data.timestamp);
        log('API Key: ' + response.data.configuration.geminiApiKey);
        log('Available endpoints: ' + response.data.endpoints.length);
        return true;
    } catch (error) {
        log('❌ Health check failed: ' + error.message, 'red');
        return false;
    }
}

async function testChatEndpoint() {
    log('\n💬 Testing Chat Endpoint', 'cyan');
    log('=' .repeat(50), 'cyan');
    
    const testMessages = [
        "Hello! How are you today?",
        "Can you give me some wellness advice for stress relief?",
        "What's a good meditation technique for beginners?"
    ];

    for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        log(`\nTest ${i + 1}: "${message}"`, 'yellow');
        
        try {
            const startTime = Date.now();
            const response = await axios.post(`${BASE_URL}/api/chat`, {
                text: message,
                voiceName: 'Sadaltager'
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            if (response.data.success) {
                log('✅ Chat response successful', 'green');
                log('Response time: ' + duration + 'ms');
                log('Text response: ' + (response.data.textResponse || 'No text response'));
                
                if (response.data.audioData) {
                    log('Audio data received: ' + response.data.audioData.length + ' characters (base64)');
                    log('Audio format: ' + response.data.audioFormat);
                    
                    // Save audio to file for testing
                    const audioBuffer = Buffer.from(response.data.audioData, 'base64');
                    const filename = `test_audio_${i + 1}.wav`;
                    fs.writeFileSync(filename, audioBuffer);
                    log('🎵 Audio saved as: ' + filename, 'magenta');
                } else {
                    log('No audio data received', 'yellow');
                }
            } else {
                log('❌ Chat response failed: ' + response.data.error, 'red');
            }
        } catch (error) {
            log('❌ Request failed: ' + error.message, 'red');
            if (error.response) {
                log('Status: ' + error.response.status);
                log('Error details: ' + JSON.stringify(error.response.data));
            }
        }
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function testAudioProcessingEndpoint() {
    log('\n🎵 Testing Audio Processing Endpoint', 'cyan');
    log('=' .repeat(50), 'cyan');
    
    // Create a dummy audio data (base64 encoded)
    const dummyAudioData = Buffer.from('dummy audio data for testing').toString('base64');
    
    try {
        const response = await axios.post(`${BASE_URL}/api/process-audio`, {
            audioData: dummyAudioData,
            format: 'wav'
        });
        
        log('✅ Audio processing successful', 'green');
        log('Message: ' + response.data.message);
        log('Received format: ' + response.data.receivedFormat);
        log('Data length: ' + response.data.dataLength);
        log('Note: ' + response.data.note, 'yellow');
        
    } catch (error) {
        log('❌ Audio processing failed: ' + error.message, 'red');
        if (error.response) {
            log('Status: ' + error.response.status);
            log('Error details: ' + JSON.stringify(error.response.data));
        }
    }
}

async function testErrorHandling() {
    log('\n⚠️  Testing Error Handling', 'cyan');
    log('=' .repeat(50), 'cyan');
    
    // Test missing text parameter
    log('\nTesting missing text parameter:', 'yellow');
    try {
        await axios.post(`${BASE_URL}/api/chat`, {});
    } catch (error) {
        if (error.response && error.response.status === 400) {
            log('✅ Correctly handled missing text parameter', 'green');
            log('Error message: ' + error.response.data.error);
        } else {
            log('❌ Unexpected error handling', 'red');
        }
    }
    
    // Test invalid endpoint
    log('\nTesting invalid endpoint:', 'yellow');
    try {
        await axios.get(`${BASE_URL}/api/nonexistent`);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            log('✅ Correctly handled invalid endpoint', 'green');
        } else {
            log('❌ Unexpected error handling', 'red');
        }
    }
}

async function runAllTests() {
    log('🚀 Starting API Tests for Kalpvraksha AI Voice API', 'magenta');
    log('Server: ' + BASE_URL, 'blue');
    log('Time: ' + new Date().toISOString(), 'blue');
    
    try {
        // Test if server is running
        const healthOk = await testHealthEndpoint();
        if (!healthOk) {
            log('\n❌ Server not responding. Please make sure the server is running with: npm run dev', 'red');
            return;
        }
        
        // Run all tests
        await testChatEndpoint();
        await testAudioProcessingEndpoint();
        await testErrorHandling();
        
        log('\n🎉 All tests completed!', 'green');
        log('\nGenerated files:', 'blue');
        for (let i = 1; i <= 3; i++) {
            const filename = `test_audio_${i}.wav`;
            if (fs.existsSync(filename)) {
                log(`- ${filename}`, 'blue');
            }
        }
        log('\nYou can play these audio files to test the voice output!', 'magenta');
        
    } catch (error) {
        log('\n💥 Test suite failed: ' + error.message, 'red');
    }
}

// Check if axios is available, if not provide installation instructions
try {
    require('axios');
    runAllTests();
} catch (error) {
    log('❌ axios not found. Please install it first:', 'red');
    log('npm install axios', 'yellow');
}