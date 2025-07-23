/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('chat')
  async chat(@Body('prompt') prompt: string): Promise<{ reply: object }> {
    try {
      const reply = await this.ollamaService.generate(prompt);
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
}
