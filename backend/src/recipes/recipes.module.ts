import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module'; // adjust relative path
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
