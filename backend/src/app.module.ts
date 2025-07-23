import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AIModule } from './ai/ai.module';
import { RecipesModule } from './recipes/recipes.module';

@Module({
  imports: [AIModule, RecipesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
