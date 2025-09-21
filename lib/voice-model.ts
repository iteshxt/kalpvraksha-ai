import {
    GoogleGenAI,
    LiveServerMessage,
    MediaResolution,
    Modality,
    Session,
} from '@google/genai';

export interface VoiceModelConfig {
    apiKey: string;
    voiceName?: string;
    systemInstruction?: string;
}

export interface VoiceResponse {
    audioData?: Buffer;
    textResponse?: string;
    success: boolean;
    error?: string;
}

export class VoiceModel {
    private ai: GoogleGenAI;
    private config: VoiceModelConfig;
    private session: Session | undefined;
    private responseQueue: LiveServerMessage[] = [];

    constructor(config: VoiceModelConfig) {
        this.config = config;
        this.ai = new GoogleGenAI({
            apiKey: config.apiKey,
        });
    }

    private async handleTurn(): Promise<LiveServerMessage[]> {
        const turn: LiveServerMessage[] = [];
        let done = false;
        while (!done) {
            const message = await this.waitMessage();
            turn.push(message);
            if (message.serverContent && message.serverContent.turnComplete) {
                done = true;
            }
        }
        return turn;
    }

    private async waitMessage(): Promise<LiveServerMessage> {
        let done = false;
        let message: LiveServerMessage | undefined = undefined;
        while (!done) {
            message = this.responseQueue.shift();
            if (message) {
                done = true;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        return message!;
    }

    private parseMimeType(mimeType: string) {
        const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
        const [_, format] = fileType.split('/');

        const options = {
            numChannels: 1,
            bitsPerSample: 16,
            sampleRate: 24000
        };

        if (format && format.startsWith('L')) {
            const bits = parseInt(format.slice(1), 10);
            if (!isNaN(bits)) {
                options.bitsPerSample = bits;
            }
        }

        for (const param of params) {
            const [key, value] = param.split('=').map(s => s.trim());
            if (key === 'rate') {
                options.sampleRate = parseInt(value, 10);
            }
        }

        return options;
    }

    private createWavHeader(dataLength: number, options: { numChannels: number; sampleRate: number; bitsPerSample: number }) {
        const { numChannels, sampleRate, bitsPerSample } = options;
        const byteRate = sampleRate * numChannels * bitsPerSample / 8;
        const blockAlign = numChannels * bitsPerSample / 8;
        const buffer = Buffer.alloc(44);

        buffer.write('RIFF', 0);
        buffer.writeUInt32LE(36 + dataLength, 4);
        buffer.write('WAVE', 8);
        buffer.write('fmt ', 12);
        buffer.writeUInt32LE(16, 16);
        buffer.writeUInt16LE(1, 20);
        buffer.writeUInt16LE(numChannels, 22);
        buffer.writeUInt32LE(sampleRate, 24);
        buffer.writeUInt32LE(byteRate, 28);
        buffer.writeUInt16LE(blockAlign, 32);
        buffer.writeUInt16LE(bitsPerSample, 34);
        buffer.write('data', 36);
        buffer.writeUInt32LE(dataLength, 40);

        return buffer;
    }

    private convertToWav(rawData: string[], mimeType: string): Buffer {
        const options = this.parseMimeType(mimeType);
        const dataLength = rawData.reduce((a, b) => a + b.length, 0);
        const wavHeader = this.createWavHeader(dataLength, options);
        const buffer = Buffer.concat(rawData.map(data => Buffer.from(data, 'base64')));

        return Buffer.concat([wavHeader, buffer]);
    }

    async generateVoiceResponse(input: string): Promise<VoiceResponse> {
        try {
            const model = 'models/gemini-2.5-flash-preview-native-audio-dialog';

            const config = {
                responseModalities: [Modality.AUDIO],
                mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: this.config.voiceName || 'Sadaltager',
                        }
                    }
                },
                contextWindowCompression: {
                    triggerTokens: '25600',
                    slidingWindow: { targetTokens: '12800' },
                },
                systemInstruction: {
                    parts: [{
                        text: this.config.systemInstruction || `{
              "persona_identity": {
                "name": "Dr. Swatantra AI",
                "role": "A compassionate guide for holistic well-being."
              },
              "communication_style": {
                "tone": "Warm, empathetic, and fatherly.",
                "language": "Use simple, clear, and uplifting language.",
                "demeanor": "Patient and non-judgmental."
              },
              "interaction_protocol": {
                "greeting": "Always begin interactions by gently inquiring about the user's holistic state.",
                "actionable_guidance": "Offer 2-3 concise, natural, and simple self-care suggestions.",
                "closing": "Conclude with positive reinforcement."
              },
              "operational_constraints": {
                "medical_disclaimer": "Crucially, any response offering advice must include the disclaimer: 'This guidance is intended to complement, not replace, professional medical advice.'",
                "scope_of_practice": "Strictly prohibit diagnosing medical conditions or prescribing pharmaceutical drugs."
              },
              "response_guidelines": {
                "conciseness": "Keep responses focused and brief, typically 3-4 lines.",
                "formatting": "Generate clean text output. Avoid using markdown, asterisks, or unnecessary symbols."
              }
            }`,
                    }]
                },
            };

            this.session = await this.ai.live.connect({
                model,
                callbacks: {
                    onopen: () => console.debug('Connection opened'),
                    onmessage: (message: LiveServerMessage) => {
                        this.responseQueue.push(message);
                    },
                    onerror: (e: ErrorEvent) => console.error('Error:', e.message),
                    onclose: (e: CloseEvent) => console.debug('Connection closed:', e.reason),
                },
                config
            });

            this.session.sendClientContent({
                turns: [input]
            });

            const turn = await this.handleTurn();

            let audioBuffer: Buffer | undefined;
            let textResponse: string | undefined;
            const audioParts: string[] = [];

            for (const message of turn) {
                if (message.serverContent?.modelTurn?.parts) {
                    for (const part of message.serverContent.modelTurn.parts) {
                        if (part.inlineData) {
                            audioParts.push(part.inlineData.data ?? '');
                            if (audioParts.length > 0) {
                                audioBuffer = this.convertToWav(audioParts, part.inlineData.mimeType ?? 'audio/pcm;rate=24000');
                            }
                        }
                        if (part.text) {
                            textResponse = part.text;
                        }
                    }
                }
            }

            this.session.close();

            return {
                audioData: audioBuffer,
                textResponse,
                success: true
            };

        } catch (error) {
            console.error('Voice model error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}