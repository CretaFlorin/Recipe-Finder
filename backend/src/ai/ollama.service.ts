import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OllamaService {
  async generate(prompt: string): Promise<string> {
    const systemPrompt = `
    You are a recipe generator AI.
    Based on the user's input, return exactly 3 recipes as a JSON array, with the following structure:
    [
      {
        "id": 1,
        "name": "Recipe Name", // short max 4 words
        "duration": "30 min.", // with a dot
      },
      ...
    ]
    Rules:   
      name: maximum 4 words
      duration: like "25 min." or "40 min." with a dot
      !!!! VERY IMPORTANT: Output only VALID JSON — NO introduction, NO markdown, NO explanation.
      User input:
    `;

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:11434/api/generate',
        data: {
          model: 'llama3:latest',
          prompt: `${systemPrompt}${prompt}`,
        },
        responseType: 'stream',
      });

      return await new Promise((resolve, reject) => {
        let result = '';

        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString('utf8').split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                result += json.response;
              }
              if (json.done) {
                resolve(result);
              }
            } catch (e) {
              // ignore parse errors of partial lines
            }
          }
        });

        response.data.on('error', (err) => {
          reject(
            new HttpException(
              'Ollama API stream error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        });

        response.data.on('end', () => {
          resolve(result); // fallback if done not triggered
        });
      });
    } catch (error: any) {
      throw new HttpException(
        error.response?.data?.error || error.message || 'Ollama API error',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
