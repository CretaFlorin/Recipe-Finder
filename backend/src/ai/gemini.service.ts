import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.gemini = new GoogleGenerativeAI(
      'AIzaSyDC8BGMkVHSO0Cz5RCWhyhCOUeh8ELWTzE',
    );
  }

  async chat(prompt: string): Promise<string> {
    const model = this.gemini.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini did not return a response.');
    }

    return text;
  }
}
