/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

const buildSystemPrompt = (userPrompt: string, negativeNames: string[]) => {
  const base = `
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
- name: maximum 4 words
- duration: like "25 min." or "40 min." with a dot
- !!!! VERY IMPORTANT: Output only VALID JSON — NO introduction, NO markdown, NO explanation.
`;

  const avoidClause = negativeNames.length
    ? `Avoid generating recipes similar to: ${negativeNames
        .map((name) => `"${name}"`)
        .join(', ')}.\n`
    : '';

  return `${base}${avoidClause}User input: ${userPrompt}`;
};

@Injectable()
export class OllamaService {
  async generate(prompt: string, negative: string): Promise<string> {
    let negativeNames: string[] = [];

    try {
      const parsedNegative = JSON.parse(negative);
      if (Array.isArray(parsedNegative)) {
        negativeNames = parsedNegative.map((r: any) => r.name).filter(Boolean);
      }
    } catch (err) {
      console.warn('Failed to parse negative recipes:', err);
    }

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:11434/api/generate',
        data: {
          model: 'llama3:latest',
          prompt: buildSystemPrompt(prompt, negativeNames),
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

  async complete(recipe: { name: string; duration: string }): Promise<{
    name: string;
    duration: string;
    ingredients: string[];
    instructions: string[];
  }> {
    const systemPrompt = `
  You are a recipe completion AI.
  Given a recipe name and duration, return a JSON object with the following structure:
  
  {
    "name": "Recipe Name",
    "duration": "25 min.",
    "ingredients": ["ingredient 1", "ingredient 2", "..."],
    "instructions": ["Step 1", "Step 2", "..."]
  }

  Rules:
  - Output must be ONLY VALID JSON — no markdown, no explanation, no intro.
  - Ingredients: max 8 simple, everyday items, lowercase, each with quantity (e.g., "1 cup flour").
  - Instructions:
  - Must have AT LEAST 5 steps.
  - Each step must be **very detailed**, ideally **100–200 words per step**.
  - Use rich, instructional language like a professional chef would.
  - Include timings, tips, and techniques (e.g., simmer gently, stir continuously).
  - Do NOT oversimplify — elaborate on each step to help a beginner understand the process.


  Recipe:
  Name: ${recipe.name}
  Duration: ${recipe.duration}
  `;

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:11434/api/generate',
        data: {
          model: 'llama3:latest',
          prompt: systemPrompt,
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
                try {
                  const parsed = JSON.parse(result);
                  resolve(parsed);
                } catch (err) {
                  reject(new HttpException('Invalid JSON from AI', 500));
                }
              }
            } catch (_) {
              // skip malformed lines
            }
          }
        });

        response.data.on('error', (err) => {
          reject(new HttpException('Ollama stream error', 500));
        });

        response.data.on('end', () => {
          try {
            const parsed = JSON.parse(result);
            resolve(parsed);
          } catch (err) {
            reject(new HttpException('Invalid JSON at end of stream', 500));
          }
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
