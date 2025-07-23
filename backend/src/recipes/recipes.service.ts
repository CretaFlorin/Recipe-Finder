/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Recipe } from 'generated/prisma';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async createRecipe(data: Prisma.RecipeCreateInput): Promise<Recipe> {
    const preparedData = {
      ...data,
      ingredients: JSON.stringify(data.ingredients),
      instructions: JSON.stringify(data.instructions),
    };

    const createdRecipe = await this.prisma.recipe.create({
      data: preparedData,
    });
    return createdRecipe as Recipe;
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return (await this.prisma.recipe.findMany()) as Recipe[];
  }

  async getFavoriteRecipes(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      where: {
        favorite: true,
      },
    });
  }

  async getRecipe(id: number): Promise<Recipe | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: id },
    });
    if (recipe) {
      recipe.ingredients = recipe.ingredients
        ? JSON.parse(recipe.ingredients)
        : [];
      recipe.instructions = recipe.instructions
        ? JSON.parse(recipe.instructions)
        : [];
      return recipe;
    } else {
      return null;
    }
  }

  async deleteRecipe(id: number): Promise<void> {
    await this.prisma.recipe.delete({
      where: { id },
    });
  }

  async updateFavorite(id: number, favorite: boolean) {
    return await this.prisma.recipe.update({
      where: { id },
      data: { favorite },
    });
  }

  async completeRecipe(
    id: number,
    ingredients: string,
    instructions: string,
  ): Promise<Recipe> {
    return this.prisma.recipe.update({
      where: { id },
      data: {
        ingredients,
        instructions,
      },
    });
  }
}
