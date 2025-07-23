/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly ollamaService: OllamaService,
    private readonly geminiService: GeminiService,
    private readonly openaiService: OpenAIService,
  ) {}

  @Post('chat')
  async chat(
    @Body('prompt') prompt: string,
    @Body('negative') negative: string,
  ): Promise<{ reply: object }> {
    try {
      const reply = await this.ollamaService.generate(prompt, negative);
      console.log(reply);

      const recipes: any[] = JSON.parse(reply);
      console.log('recipes:', JSON.stringify(recipes, null, 2));

      return { reply: recipes };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('complete')
  async complete(
    @Body('name') name: string,
    @Body('duration') duration: string,
  ): Promise<object> {
    console.log(name, duration);
    try {
      const reply = await this.ollamaService.complete({ name, duration });
      console.log(reply);

      const recipy: any = reply;
      console.log('complete::', JSON.stringify(recipy, null, 2));

      return { recipy };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // ! Doesn't work yet
  @Post('image-link')
  async getImageLink(
    @Body('prompt') prompt: string,
  ): Promise<{ imageUrl: string }> {
    try {
      const response = await this.geminiService.chat(prompt);
      const imageUrl = response.trim();

      if (!imageUrl.startsWith('http')) {
        throw new Error('Invalid image URL returned from Gemini');
      }

      return { imageUrl };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Unknown error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
