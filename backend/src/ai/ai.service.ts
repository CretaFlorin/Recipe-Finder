import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Injectable()
export class AIService {
  constructor(private readonly openAIService: OpenAIService) {}

  async getAnswer(prompt: string): Promise<string> {
    return this.openAIService.chatCompletion(prompt);
  }
}
