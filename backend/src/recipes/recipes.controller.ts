import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { Prisma, Recipe } from '../../generated/prisma';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getAllRecipes(): Promise<Recipe[]> {
    return this.recipesService.getAllRecipes();
  }

  @Get(':id')
  async getRecipe(@Param('id') id: string): Promise<Recipe | null> {
    return this.recipesService.getRecipe(+id);
  }
  
  @Post()
  async createRecipe(@Body() data: Prisma.RecipeCreateInput): Promise<Recipe> {
    return this.recipesService.createRecipe(data);
  }

  @Delete(':id')
  async deleteRecipe(@Param('id') id: string): Promise<{ message: string }> {
    await this.recipesService.deleteRecipe(+id);
    return { message: `Recipe with id ${id} deleted successfully.` };
  }

  @Patch(':id/favorite')
  async updateFavorite(
    @Param('id') id: string,
    @Body('favorite') favorite: boolean,
  ) {
    return this.recipesService.updateFavorite(+id, favorite);
  }
}
