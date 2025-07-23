import { Module } from '@nestjs/common';
// import { AIService } from './ai.service';
import { OpenAIService } from './openai.service';
import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';
import { OllamaService } from './ollama.service';

@Module({
  providers: [OpenAIService, GeminiService, OllamaService],
  controllers: [AiController],
  exports: [OpenAIService, GeminiService, OllamaService],
})
export class AIModule {}
