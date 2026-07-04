import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Retrieves the API key from environment config if available.
   */
  getApiKeyFromEnv(): string | undefined {
    return this.configService.get<string>('AI_STUDIO_API_KEY');
  }

  /**
   * Verifies connection to Google Gemini API using the provided key,
   * falling back to the configured environment key.
   */
  async checkConnection(apiKey?: string): Promise<{
    success: boolean;
    configured: boolean;
    model?: string;
    message?: string;
    error?: string;
  }> {
    const key = apiKey || this.getApiKeyFromEnv();

    if (!key) {
      return {
        success: false,
        configured: false,
        error: 'Google API key is not configured. Please set the AI_STUDIO_API_KEY environment variable or provide a key.',
      };
    }

    // Mask key for safety log
    const maskedKey = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***';
    this.logger.log(`Testing Google Gemini API connection with key: ${maskedKey}`);

    try {
      // Use gemini-2.5-flash for a lightweight connection verification check
      const modelName = 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: 'Hello, please reply with a short confirmation message saying that the Google Gemini API connection is active.',
              },
            ],
          },
        ],
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        return {
          success: true,
          configured: true,
          model: modelName,
          message: responseText.trim(),
        };
      }

      throw new Error('Invalid response structure received from Gemini API.');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMsg = err.response?.data?.error?.message || err.message || 'Unknown Gemini API connection error';
      this.logger.error(`Gemini connection test failed: ${errorMsg}`);
      return {
        success: false,
        configured: true,
        error: errorMsg,
      };
    }
  }

  /**
   * Generates TRIZ solutions using the Google Gemini API.
   */
  async generateTrizSolutions(problemDescription: string, principlesText: string): Promise<any[]> {
    const key = this.getApiKeyFromEnv();
    if (!key) {
      throw new Error('Google API key is not configured.');
    }

    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    const prompt = `
You are an expert TRIZ (Theory of Inventive Problem Solving) R&D consultant.
I have a problem description and a set of TRIZ principles extracted from the contradiction matrix.

Problem Description:
"${problemDescription}"

Extracted TRIZ Principles:
${principlesText}

Please generate exactly 3 distinct candidate solutions that apply these principles to solve the problem.
Return your response ONLY as a JSON array of objects with the following keys:
- title: string (A catchy name for the solution)
- description: string (Detailed explanation of how the solution works)
- recovery: number (A score from 1 to 10 representing recovery potential or effectiveness)
- scalability: number (A score from 1 to 10 representing scalability)
- cost: number (A score from 1 to 10 representing cost efficiency)
- safety: number (A score from 1 to 10 representing safety index)
- speed: number (A score from 1 to 10 representing disassembly/processing speed)
- winner: boolean (Set true for the best solution, false for others. Exactly one should be true)
- principles: string (Which specific principles were used for this solution)

Do not include markdown code block syntax like \`\`\`json. Return raw JSON array.
    `;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('No response text received from Gemini API');
      }

      return JSON.parse(responseText);
    } catch (error: unknown) {
      this.logger.error('Failed to generate TRIZ solutions', error);
      throw error;
    }
  }
}
