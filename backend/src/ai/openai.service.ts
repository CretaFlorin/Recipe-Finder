import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey:
        '',
    });
  }

  async chatCompletion(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    if (
      response.choices &&
      response.choices.length > 0 &&
      response.choices[0].message.content
    ) {
      return response.choices[0].message.content;
    }
    throw new Error('No response from OpenAI');
  }
}
